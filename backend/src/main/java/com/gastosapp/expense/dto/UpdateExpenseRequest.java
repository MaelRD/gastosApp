package com.gastosapp.expense.dto;

import com.gastosapp.expense.Category;
import com.gastosapp.expense.SplitType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Payload used to edit an existing expense. The trip an expense belongs to
 * cannot be changed.
 */
public record UpdateExpenseRequest(

        @NotNull(message = "payerId is required")
        Long payerId,

        @NotBlank(message = "description is required")
        String description,

        @NotNull(message = "totalAmount is required")
        @Positive(message = "totalAmount must be greater than zero")
        BigDecimal totalAmount,

        @NotNull(message = "date is required")
        LocalDate date,

        @NotNull(message = "category is required")
        Category category,

        @NotNull(message = "splitType is required")
        SplitType splitType,

        String notes,

        @NotEmpty(message = "an expense must have at least one split")
        List<@Valid ExpenseSplitRequest> splits
) {
}
