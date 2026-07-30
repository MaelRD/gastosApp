package com.gastosapp.expense;

/**
 * How an expense's splits were derived, kept so the UI can reopen an
 * expense for editing in the same split mode it was created with.
 */
public enum SplitType {
    EQUAL,
    PERCENTAGE,
    FIXED
}
