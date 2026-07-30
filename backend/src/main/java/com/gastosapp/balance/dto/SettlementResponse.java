package com.gastosapp.balance.dto;

import java.math.BigDecimal;

/**
 * A single suggested transfer that settles debts between two participants,
 * part of the minimal set of transfers produced by the debt-simplification
 * algorithm.
 */
public record SettlementResponse(
        Long fromUserId,
        String fromName,
        Long toUserId,
        String toName,
        BigDecimal amount
) {
}
