package com.gastosapp.balance.dto;

import java.util.List;

public record BalanceResponse(
        List<ParticipantBalanceResponse> balances,
        List<SettlementResponse> settlements
) {
}
