package com.gastosapp.common;

/**
 * Thrown when a referenced entity (trip, user, expense, ...) does not exist.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
