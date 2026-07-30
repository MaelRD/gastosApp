import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';

const TripDataContext = createContext(null);

const DARK_KEY = 'gastosapp:dark';

function readPaidSettlements(tripId) {
  try {
    return new Set(JSON.parse(localStorage.getItem(`gastosapp:paid:${tripId}`) || '[]'));
  } catch {
    return new Set();
  }
}

function readCurrentUserId(tripId) {
  const raw = localStorage.getItem(`gastosapp:me:${tripId}`);
  return raw ? Number(raw) : null;
}

export function TripDataProvider({ children }) {
  const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balance, setBalance] = useState({ balances: [], settlements: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dark, setDark] = useState(() => localStorage.getItem(DARK_KEY) === 'true');
  const [paidSettlements, setPaidSettlements] = useState(new Set());
  const [currentUserId, setCurrentUserIdState] = useState(null);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem(DARK_KEY, String(dark));
  }, [dark]);

  const refreshTrip = useCallback(async (tripId) => {
    setTrip(await api.getTrip(tripId));
  }, []);

  const refreshExpenses = useCallback(async (tripId) => {
    setExpenses(await api.listExpenses(tripId));
  }, []);

  const refreshBalance = useCallback(async (tripId) => {
    setBalance(await api.getBalance(tripId));
  }, []);

  const refreshAll = useCallback(async (tripId) => {
    await Promise.all([refreshTrip(tripId), refreshExpenses(tripId), refreshBalance(tripId)]);
  }, [refreshTrip, refreshExpenses, refreshBalance]);

  useEffect(() => {
    (async () => {
      try {
        const trips = await api.listTrips();
        const activeTrip = trips[0] || (await api.createTrip({ name: 'GASTOS', currency: 'MXN' }));
        setPaidSettlements(readPaidSettlements(activeTrip.id));
        const savedUserId = readCurrentUserId(activeTrip.id);
        const validSavedUser = savedUserId && activeTrip.participants.some((p) => p.id === savedUserId);
        setCurrentUserIdState(validSavedUser ? savedUserId : (activeTrip.participants[0]?.id ?? null));
        await refreshAll(activeTrip.id);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshAll]);

  const addParticipant = useCallback(async (name) => {
    await api.addParticipant(trip.id, { name });
    await refreshTrip(trip.id);
  }, [trip, refreshTrip]);

  const removeParticipant = useCallback(async (userId) => {
    await api.removeParticipant(trip.id, userId);
    await refreshAll(trip.id);
  }, [trip, refreshAll]);

  const createExpense = useCallback(async (payload) => {
    await api.createExpense({ ...payload, tripId: trip.id });
    await refreshAll(trip.id);
  }, [trip, refreshAll]);

  const updateExpense = useCallback(async (id, payload) => {
    await api.updateExpense(id, payload);
    await refreshAll(trip.id);
  }, [trip, refreshAll]);

  const deleteExpense = useCallback(async (id) => {
    await api.deleteExpense(id);
    await refreshAll(trip.id);
  }, [trip, refreshAll]);

  const updateTripSettings = useCallback(async (payload) => {
    await api.updateTrip(trip.id, payload);
    await refreshTrip(trip.id);
  }, [trip, refreshTrip]);

  const deleteTrip = useCallback(async () => {
    await api.deleteTrip(trip.id);
    const newTrip = await api.createTrip({ name: 'GASTOS', currency: trip.currency });
    setPaidSettlements(new Set());
    await refreshAll(newTrip.id);
  }, [trip, refreshAll]);

  const setCurrentUserId = useCallback((userId) => {
    setCurrentUserIdState(userId);
    if (trip) localStorage.setItem(`gastosapp:me:${trip.id}`, String(userId));
  }, [trip]);

  const toggleSettlementPaid = useCallback((key) => {
    setPaidSettlements((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      if (trip) localStorage.setItem(`gastosapp:paid:${trip.id}`, JSON.stringify([...next]));
      return next;
    });
  }, [trip]);

  const value = useMemo(() => ({
    trip, expenses, balance, loading, error, dark,
    setDark, paidSettlements, toggleSettlementPaid,
    currentUserId, setCurrentUserId,
    addParticipant, removeParticipant,
    createExpense, updateExpense, deleteExpense,
    updateTripSettings, deleteTrip,
    refreshAll: () => trip && refreshAll(trip.id),
  }), [trip, expenses, balance, loading, error, dark, paidSettlements, toggleSettlementPaid,
      currentUserId, setCurrentUserId,
      addParticipant, removeParticipant, createExpense, updateExpense, deleteExpense,
      updateTripSettings, deleteTrip, refreshAll]);

  return <TripDataContext.Provider value={value}>{children}</TripDataContext.Provider>;
}

export function useTripData() {
  const ctx = useContext(TripDataContext);
  if (!ctx) throw new Error('useTripData must be used within a TripDataProvider');
  return ctx;
}
