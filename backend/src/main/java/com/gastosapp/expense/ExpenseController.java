package com.gastosapp.expense;

import com.gastosapp.expense.dto.CreateExpenseRequest;
import com.gastosapp.expense.dto.ExpenseResponse;
import com.gastosapp.expense.dto.UpdateExpenseRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @PostMapping
    public ResponseEntity<ExpenseResponse> createExpense(@Valid @RequestBody CreateExpenseRequest request) {
        ExpenseResponse response = expenseService.registerExpense(request);
        return ResponseEntity.created(URI.create("/api/expenses/" + response.id())).body(response);
    }

    @GetMapping
    public List<ExpenseResponse> listExpenses(@RequestParam Long tripId) {
        return expenseService.listExpenses(tripId);
    }

    @GetMapping("/{id}")
    public ExpenseResponse getExpense(@PathVariable Long id) {
        return expenseService.getExpense(id);
    }

    @PutMapping("/{id}")
    public ExpenseResponse updateExpense(@PathVariable Long id, @Valid @RequestBody UpdateExpenseRequest request) {
        return expenseService.updateExpense(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }
}
