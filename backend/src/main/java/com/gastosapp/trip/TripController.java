package com.gastosapp.trip;

import com.gastosapp.trip.dto.AddParticipantRequest;
import com.gastosapp.trip.dto.CreateTripRequest;
import com.gastosapp.trip.dto.ParticipantResponse;
import com.gastosapp.trip.dto.TripResponse;
import com.gastosapp.trip.dto.UpdateTripRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    private final TripService tripService;

    public TripController(TripService tripService) {
        this.tripService = tripService;
    }

    @GetMapping
    public List<TripResponse> listTrips() {
        return tripService.listTrips();
    }

    @PostMapping
    public ResponseEntity<TripResponse> createTrip(@Valid @RequestBody CreateTripRequest request) {
        TripResponse response = tripService.createTrip(request);
        return ResponseEntity.created(URI.create("/api/trips/" + response.id())).body(response);
    }

    @GetMapping("/{id}")
    public TripResponse getTrip(@PathVariable Long id) {
        return tripService.getTrip(id);
    }

    @PutMapping("/{id}")
    public TripResponse updateTrip(@PathVariable Long id, @Valid @RequestBody UpdateTripRequest request) {
        return tripService.updateTrip(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrip(@PathVariable Long id) {
        tripService.deleteTrip(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/participants")
    public ResponseEntity<ParticipantResponse> addParticipant(@PathVariable Long id,
                                                               @Valid @RequestBody AddParticipantRequest request) {
        return ResponseEntity.ok(tripService.addParticipant(id, request));
    }

    @DeleteMapping("/{id}/participants/{userId}")
    public ResponseEntity<Void> removeParticipant(@PathVariable Long id, @PathVariable Long userId) {
        tripService.removeParticipant(id, userId);
        return ResponseEntity.noContent().build();
    }
}
