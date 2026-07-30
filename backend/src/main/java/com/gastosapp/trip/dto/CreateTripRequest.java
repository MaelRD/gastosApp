package com.gastosapp.trip.dto;

import com.gastosapp.trip.Currency;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateTripRequest(

        @NotBlank(message = "name is required")
        String name,

        @NotNull(message = "currency is required")
        Currency currency
) {
}
