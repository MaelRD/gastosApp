package com.gastosapp.trip.dto;

import com.gastosapp.trip.Currency;

import java.util.List;

public record TripResponse(
        Long id,
        String name,
        Currency currency,
        List<ParticipantResponse> participants
) {
}
