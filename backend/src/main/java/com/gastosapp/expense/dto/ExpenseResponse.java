package com.gastosapp.expense.dto;

import com.gastosapp.expense.Category;
import com.gastosapp.expense.SplitType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Read model returned after an expense (and its splits) has been persisted.
 */
public record ExpenseResponse(
        Long id,
        Long tripId,
        Long payerId,
        String payerName,
        String description,
        BigDecimal totalAmount,
        LocalDate date,
        Category category,
        SplitType splitType,
        String notes,
        List<ExpenseSplitResponse> splits
) {
}
