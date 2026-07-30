package com.gastosapp.expense;

/**
 * Thrown when an expense payload violates a domain invariant,
 * e.g. splits that do not add up to the total amount.
 */
public class InvalidExpenseException extends RuntimeException {

    public InvalidExpenseException(String message) {
        super(message);
    }
}
