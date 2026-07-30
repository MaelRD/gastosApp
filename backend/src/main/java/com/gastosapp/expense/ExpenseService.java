package com.gastosapp.expense;

import com.gastosapp.common.ResourceNotFoundException;
import com.gastosapp.expense.dto.CreateExpenseRequest;
import com.gastosapp.expense.dto.ExpenseResponse;
import com.gastosapp.expense.dto.ExpenseSplitRequest;
import com.gastosapp.expense.dto.ExpenseSplitResponse;
import com.gastosapp.expense.dto.UpdateExpenseRequest;
import com.gastosapp.trip.Trip;
import com.gastosapp.trip.TripRepository;
import com.gastosapp.user.User;
import com.gastosapp.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    private static final BigDecimal ROUNDING_TOLERANCE = new BigDecimal("0.01");

    private final ExpenseRepository expenseRepository;
    private final ExpenseSplitRepository expenseSplitRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    public ExpenseService(ExpenseRepository expenseRepository,
                           ExpenseSplitRepository expenseSplitRepository,
                           TripRepository tripRepository,
                           UserRepository userRepository) {
        this.expenseRepository = expenseRepository;
        this.expenseSplitRepository = expenseSplitRepository;
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
    }

    /**
     * Registers a new expense along with how it is split across participants.
     * The expense and every split are persisted atomically: if any part fails,
     * the whole operation is rolled back.
     */
    @Transactional
    public ExpenseResponse registerExpense(CreateExpenseRequest request) {
        validateSplitsMatchTotal(request.totalAmount(), request.splits());

        Trip trip = tripRepository.findById(request.tripId())
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found: " + request.tripId()));

        User payer = userRepository.findById(request.payerId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.payerId()));

        Expense expense = new Expense();
        expense.setTrip(trip);
        expense.setPayer(payer);
        expense.setDescription(request.description());
        expense.setTotalAmount(request.totalAmount());
        expense.setDate(request.date());
        expense.setCategory(request.category());
        expense.setSplitType(request.splitType());
        expense.setNotes(request.notes());
        Expense savedExpense = expenseRepository.save(expense);

        List<ExpenseSplit> savedSplits = saveSplits(savedExpense, request.splits());

        return toResponse(savedExpense, savedSplits);
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> listExpenses(Long tripId) {
        return expenseRepository.findByTripIdOrderByDateDesc(tripId).stream()
                .map(expense -> toResponse(expense, expenseSplitRepository.findByExpenseId(expense.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public ExpenseResponse getExpense(Long id) {
        Expense expense = findExpenseOrThrow(id);
        return toResponse(expense, expenseSplitRepository.findByExpenseId(id));
    }

    @Transactional
    public ExpenseResponse updateExpense(Long id, UpdateExpenseRequest request) {
        validateSplitsMatchTotal(request.totalAmount(), request.splits());

        Expense expense = findExpenseOrThrow(id);

        User payer = userRepository.findById(request.payerId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.payerId()));

        expense.setPayer(payer);
        expense.setDescription(request.description());
        expense.setTotalAmount(request.totalAmount());
        expense.setDate(request.date());
        expense.setCategory(request.category());
        expense.setSplitType(request.splitType());
        expense.setNotes(request.notes());
        Expense savedExpense = expenseRepository.save(expense);

        expenseSplitRepository.deleteByExpenseId(id);
        List<ExpenseSplit> savedSplits = saveSplits(savedExpense, request.splits());

        return toResponse(savedExpense, savedSplits);
    }

    @Transactional
    public void deleteExpense(Long id) {
        findExpenseOrThrow(id);
        expenseSplitRepository.deleteByExpenseId(id);
        expenseRepository.deleteById(id);
    }

    /**
     * Deletes every expense (and its splits) belonging to a trip. Used when a
     * whole trip/group is deleted.
     */
    @Transactional
    public void deleteExpensesByTrip(Long tripId) {
        List<Expense> expenses = expenseRepository.findByTripIdOrderByDateDesc(tripId);
        expenses.forEach(expense -> expenseSplitRepository.deleteByExpenseId(expense.getId()));
        expenseRepository.deleteAll(expenses);
    }

    private Expense findExpenseOrThrow(Long id) {
        return expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found: " + id));
    }

    private List<ExpenseSplit> saveSplits(Expense expense, List<ExpenseSplitRequest> splitRequests) {
        Map<Long, User> participants = loadParticipants(splitRequests);

        return splitRequests.stream()
                .map(splitRequest -> {
                    ExpenseSplit split = new ExpenseSplit();
                    split.setExpense(expense);
                    split.setUser(participants.get(splitRequest.userId()));
                    split.setAmountOwed(splitRequest.amountOwed());
                    return expenseSplitRepository.save(split);
                })
                .toList();
    }

    private Map<Long, User> loadParticipants(List<ExpenseSplitRequest> splits) {
        List<Long> userIds = splits.stream().map(ExpenseSplitRequest::userId).distinct().toList();
        List<User> users = userRepository.findAllById(userIds);

        if (users.size() != userIds.size()) {
            throw new ResourceNotFoundException("One or more participants do not exist");
        }

        return users.stream().collect(Collectors.toMap(User::getId, Function.identity()));
    }

    private void validateSplitsMatchTotal(BigDecimal totalAmount, List<ExpenseSplitRequest> splits) {
        BigDecimal splitsSum = splits.stream()
                .map(ExpenseSplitRequest::amountOwed)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (splitsSum.subtract(totalAmount).abs().compareTo(ROUNDING_TOLERANCE) > 0) {
            throw new InvalidExpenseException(
                    "Splits total (%s) does not match the expense total amount (%s)"
                            .formatted(splitsSum, totalAmount));
        }
    }

    private ExpenseResponse toResponse(Expense expense, List<ExpenseSplit> splits) {
        List<ExpenseSplitResponse> splitResponses = splits.stream()
                .map(split -> new ExpenseSplitResponse(
                        split.getId(),
                        split.getUser().getId(),
                        split.getUser().getName(),
                        split.getAmountOwed()))
                .toList();

        return new ExpenseResponse(
                expense.getId(),
                expense.getTrip().getId(),
                expense.getPayer().getId(),
                expense.getPayer().getName(),
                expense.getDescription(),
                expense.getTotalAmount(),
                expense.getDate(),
                expense.getCategory(),
                expense.getSplitType(),
                expense.getNotes(),
                splitResponses);
    }
}
