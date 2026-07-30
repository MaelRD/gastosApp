package com.gastosapp.balance.dto;

import java.math.BigDecimal;

public record ParticipantBalanceResponse(
        Long userId,
        String name,
        BigDecimal paid,
        BigDecimal owed,
        BigDecimal net
) {
}
