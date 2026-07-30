const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

class ApiError extends Error {
  constructor(message, status, fieldErrors) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors || null;
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) return null;

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new ApiError(body?.message || `Request failed: ${response.status}`, response.status, body?.fieldErrors);
  }
  return body;
}

export const api = {
  listTrips: () => request('/trips'),
  createTrip: (data) => request('/trips', { method: 'POST', body: JSON.stringify(data) }),
  getTrip: (tripId) => request(`/trips/${tripId}`),
  updateTrip: (tripId, data) => request(`/trips/${tripId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTrip: (tripId) => request(`/trips/${tripId}`, { method: 'DELETE' }),

  addParticipant: (tripId, data) => request(`/trips/${tripId}/participants`, { method: 'POST', body: JSON.stringify(data) }),
  removeParticipant: (tripId, userId) => request(`/trips/${tripId}/participants/${userId}`, { method: 'DELETE' }),

  listExpenses: (tripId) => request(`/expenses?tripId=${tripId}`),
  getExpense: (id) => request(`/expenses/${id}`),
  createExpense: (data) => request('/expenses', { method: 'POST', body: JSON.stringify(data) }),
  updateExpense: (id, data) => request(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteExpense: (id) => request(`/expenses/${id}`, { method: 'DELETE' }),

  getBalance: (tripId) => request(`/trips/${tripId}/balance`),
};

export { ApiError };
