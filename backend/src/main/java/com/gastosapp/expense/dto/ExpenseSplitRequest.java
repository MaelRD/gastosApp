package com.gastosapp.expense.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

/**
 * Share of an expense owed by a single participant.
 */
public record ExpenseSplitRequest(

        @NotNull(message = "userId is required")
        Long userId,

        @NotNull(message = "amountOwed is required")
        @Positive(message = "amountOwed must be greater than zero")
        BigDecimal amountOwed
) {
}
