package com.gastosapp.trip.dto;

import jakarta.validation.constraints.NotBlank;

public record AddParticipantRequest(

        @NotBlank(message = "name is required")
        String name
) {
}
