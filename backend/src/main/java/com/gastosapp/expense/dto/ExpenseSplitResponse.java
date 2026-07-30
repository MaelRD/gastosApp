package com.gastosapp.expense.dto;

import java.math.BigDecimal;

/**
 * Read model for a single participant's share of an expense.
 */
public record ExpenseSplitResponse(
        Long id,
        Long userId,
        String userName,
        BigDecimal amountOwed
) {
}
