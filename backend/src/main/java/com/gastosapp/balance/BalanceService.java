package com.gastosapp.balance;

import com.gastosapp.balance.dto.BalanceResponse;
import com.gastosapp.balance.dto.ParticipantBalanceResponse;
import com.gastosapp.balance.dto.SettlementResponse;
import com.gastosapp.common.ResourceNotFoundException;
import com.gastosapp.expense.Expense;
import com.gastosapp.expense.ExpenseRepository;
import com.gastosapp.expense.ExpenseSplit;
import com.gastosapp.expense.ExpenseSplitRepository;
import com.gastosapp.trip.Trip;
import com.gastosapp.trip.TripRepository;
import com.gastosapp.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BalanceService {

    private static final BigDecimal SETTLEMENT_THRESHOLD = new BigDecimal("0.5");

    private final TripRepository tripRepository;
    private final ExpenseRepository expenseRepository;
    private final ExpenseSplitRepository expenseSplitRepository;

    public BalanceService(TripRepository tripRepository,
                           ExpenseRepository expenseRepository,
                           ExpenseSplitRepository expenseSplitRepository) {
        this.tripRepository = tripRepository;
        this.expenseRepository = expenseRepository;
        this.expenseSplitRepository = expenseSplitRepository;
    }

    @Transactional(readOnly = true)
    public BalanceResponse computeBalance(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found: " + tripId));

        Map<Long, BigDecimal> paid = new HashMap<>();
        Map<Long, BigDecimal> owed = new HashMap<>();
        for (User participant : trip.getParticipants()) {
            paid.put(participant.getId(), BigDecimal.ZERO);
            owed.put(participant.getId(), BigDecimal.ZERO);
        }

        List<Expense> expenses = expenseRepository.findByTripIdOrderByDateDesc(tripId);
        for (Expense expense : expenses) {
            Long payerId = expense.getPayer().getId();
            paid.merge(payerId, expense.getTotalAmount(), BigDecimal::add);

            for (ExpenseSplit split : expenseSplitRepository.findByExpenseId(expense.getId())) {
                owed.merge(split.getUser().getId(), split.getAmountOwed(), BigDecimal::add);
            }
        }

        List<ParticipantBalanceResponse> balances = trip.getParticipants().stream()
                .map(participant -> {
                    BigDecimal participantPaid = paid.getOrDefault(participant.getId(), BigDecimal.ZERO);
                    BigDecimal participantOwed = owed.getOrDefault(participant.getId(), BigDecimal.ZERO);
                    BigDecimal net = participantPaid.subtract(participantOwed).setScale(2, RoundingMode.HALF_UP);
                    return new ParticipantBalanceResponse(participant.getId(), participant.getName(),
                            participantPaid.setScale(2, RoundingMode.HALF_UP),
                            participantOwed.setScale(2, RoundingMode.HALF_UP), net);
                })
                .toList();

        List<SettlementResponse> settlements = computeSettlements(trip.getParticipants(), balances);

        return new BalanceResponse(balances, settlements);
    }

    /**
     * Greedy debt-simplification: matches the largest creditor against the
     * largest debtor repeatedly, producing close to the minimal number of
     * transfers needed to settle every balance.
     */
    private List<SettlementResponse> computeSettlements(List<User> participants,
                                                          List<ParticipantBalanceResponse> balances) {
        Map<Long, String> namesById = new HashMap<>();
        participants.forEach(p -> namesById.put(p.getId(), p.getName()));

        List<MutableAmount> creditors = new ArrayList<>();
        List<MutableAmount> debtors = new ArrayList<>();
        for (ParticipantBalanceResponse balance : balances) {
            if (balance.net().compareTo(SETTLEMENT_THRESHOLD) > 0) {
                creditors.add(new MutableAmount(balance.userId(), balance.net()));
            } else if (balance.net().negate().compareTo(SETTLEMENT_THRESHOLD) > 0) {
                debtors.add(new MutableAmount(balance.userId(), balance.net().negate()));
            }
        }
        creditors.sort(Comparator.comparing((MutableAmount m) -> m.amount).reversed());
        debtors.sort(Comparator.comparing((MutableAmount m) -> m.amount).reversed());

        List<SettlementResponse> settlements = new ArrayList<>();
        int ci = 0;
        int di = 0;
        while (ci < creditors.size() && di < debtors.size()) {
            MutableAmount creditor = creditors.get(ci);
            MutableAmount debtor = debtors.get(di);
            BigDecimal pay = creditor.amount.min(debtor.amount).setScale(2, RoundingMode.HALF_UP);

            settlements.add(new SettlementResponse(
                    debtor.userId, namesById.get(debtor.userId),
                    creditor.userId, namesById.get(creditor.userId),
                    pay));

            creditor.amount = creditor.amount.subtract(pay);
            debtor.amount = debtor.amount.subtract(pay);
            if (creditor.amount.compareTo(SETTLEMENT_THRESHOLD) < 0) {
                ci++;
            }
            if (debtor.amount.compareTo(SETTLEMENT_THRESHOLD) < 0) {
                di++;
            }
        }
        return settlements;
    }

    private static final class MutableAmount {
        private final Long userId;
        private BigDecimal amount;

        private MutableAmount(Long userId, BigDecimal amount) {
            this.userId = userId;
            this.amount = amount;
        }
    }
}
