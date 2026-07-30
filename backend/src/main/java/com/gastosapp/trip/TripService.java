package com.gastosapp.trip;

import com.gastosapp.common.ResourceNotFoundException;
import com.gastosapp.expense.ExpenseService;
import com.gastosapp.trip.dto.AddParticipantRequest;
import com.gastosapp.trip.dto.CreateTripRequest;
import com.gastosapp.trip.dto.ParticipantResponse;
import com.gastosapp.trip.dto.TripResponse;
import com.gastosapp.trip.dto.UpdateTripRequest;
import com.gastosapp.user.User;
import com.gastosapp.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final ExpenseService expenseService;

    public TripService(TripRepository tripRepository, UserRepository userRepository, ExpenseService expenseService) {
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
        this.expenseService = expenseService;
    }

    @Transactional(readOnly = true)
    public List<TripResponse> listTrips() {
        return tripRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public TripResponse createTrip(CreateTripRequest request) {
        Trip trip = new Trip();
        trip.setName(request.name());
        trip.setDate(LocalDate.now());
        trip.setCurrency(request.currency());
        return toResponse(tripRepository.save(trip));
    }

    @Transactional(readOnly = true)
    public TripResponse getTrip(Long id) {
        return toResponse(findTripOrThrow(id));
    }

    @Transactional
    public TripResponse updateTrip(Long id, UpdateTripRequest request) {
        Trip trip = findTripOrThrow(id);
        trip.setName(request.name());
        trip.setCurrency(request.currency());
        return toResponse(tripRepository.save(trip));
    }

    @Transactional
    public void deleteTrip(Long id) {
        Trip trip = findTripOrThrow(id);
        expenseService.deleteExpensesByTrip(id);
        trip.getParticipants().clear();
        tripRepository.save(trip);
        tripRepository.delete(trip);
    }

    @Transactional
    public ParticipantResponse addParticipant(Long tripId, AddParticipantRequest request) {
        Trip trip = findTripOrThrow(tripId);
        User user = new User();
        user.setName(request.name());
        User savedUser = userRepository.save(user);
        trip.getParticipants().add(savedUser);
        tripRepository.save(trip);
        return new ParticipantResponse(savedUser.getId(), savedUser.getName());
    }

    @Transactional
    public void removeParticipant(Long tripId, Long userId) {
        Trip trip = findTripOrThrow(tripId);
        boolean removed = trip.getParticipants().removeIf(user -> user.getId().equals(userId));
        if (!removed) {
            throw new ResourceNotFoundException("Participant %d is not part of trip %d".formatted(userId, tripId));
        }
        tripRepository.save(trip);
    }

    private Trip findTripOrThrow(Long id) {
        return tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found: " + id));
    }

    private TripResponse toResponse(Trip trip) {
        List<ParticipantResponse> participants = trip.getParticipants().stream()
                .map(user -> new ParticipantResponse(user.getId(), user.getName()))
                .toList();
        return new TripResponse(trip.getId(), trip.getName(), trip.getCurrency(), participants);
    }
}
