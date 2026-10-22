import { getTripStatus } from '../utils/tripUtils.js'

/**
 * TripSync API Base URL.
 * Uses VITE_API_URL if configured, otherwise defaults to local Express backend on port 5001.
 */
/**
 * TripSync API Base URL.
 * Uses VITE_API_URL if configured, otherwise defaults to local Express backend on port 5001.
 */
export function getApiBaseUrl() {
  if (
    typeof globalThis !== 'undefined' &&
    globalThis.process &&
    globalThis.process.env &&
    globalThis.process.env.VITE_API_URL
  ) {
    return globalThis.process.env.VITE_API_URL.replace(/\/+$/, '')
  }
  return (
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
    'http://localhost:5001/api'
  ).replace(/\/+$/, '')
}

/**
 * Normalizes backend date values to 'YYYY-MM-DD' format for frontend HTML date inputs.
 *
 * @param {string|Date} dateVal
 * @returns {string}
 */
export function normalizeDate(dateVal) {
  if (!dateVal) return ''
  if (typeof dateVal === 'string') {
    return dateVal.split('T')[0]
  }
  if (dateVal instanceof Date && !isNaN(dateVal.getTime())) {
    return dateVal.toISOString().split('T')[0]
  }
  return ''
}

/**
 * Normalizes a raw trip document from the backend to match the frontend component expectations:
 * - Maps MongoDB `_id` to `id` (and retains `_id`).
 * - Formats `startDate` and `endDate` as 'YYYY-MM-DD' strings.
 * - Guarantees safe default arrays for `itinerary`, `expenses`, `bookings`, and `tasks`.
 * - Computes or preserves `status` ('Upcoming', 'Ongoing', 'Past').
 *
 * @param {Object} rawTrip
 * @returns {Object|null}
 */
export function normalizeTrip(rawTrip) {
  if (!rawTrip || typeof rawTrip !== 'object') return null

  const id = rawTrip.id || (rawTrip._id ? String(rawTrip._id) : '')
  const startDate = normalizeDate(rawTrip.startDate)
  const endDate = normalizeDate(rawTrip.endDate)

  return {
    ...rawTrip,
    id,
    _id: rawTrip._id ? String(rawTrip._id) : id,
    name: typeof rawTrip.name === 'string' ? rawTrip.name.trim() : '',
    destination: typeof rawTrip.destination === 'string' ? rawTrip.destination.trim() : '',
    startDate,
    endDate,
    travelers: typeof rawTrip.travelers === 'number' ? rawTrip.travelers : parseInt(rawTrip.travelers, 10) || 1,
    budget: typeof rawTrip.budget === 'number' ? rawTrip.budget : Number(rawTrip.budget) || 0,
    notes: typeof rawTrip.notes === 'string' ? rawTrip.notes.trim() : '',
    itinerary: Array.isArray(rawTrip.itinerary) ? rawTrip.itinerary : [],
    expenses: Array.isArray(rawTrip.expenses) ? rawTrip.expenses : [],
    bookings: Array.isArray(rawTrip.bookings) ? rawTrip.bookings : [],
    tasks: Array.isArray(rawTrip.tasks) ? rawTrip.tasks : [],
    status: rawTrip.status || getTripStatus(startDate, endDate),
    createdAt: rawTrip.createdAt ? new Date(rawTrip.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: rawTrip.updatedAt ? new Date(rawTrip.updatedAt).toISOString() : new Date().toISOString(),
  }
}

/**
 * Safely extracts error messages from failed API responses.
 *
 * @param {Response} res
 * @param {Object} data
 * @returns {string}
 */
function extractErrorMessage(res, data) {
  if (data && typeof data === 'object') {
    if (data.message) return data.message
    if (data.error) return typeof data.error === 'string' ? data.error : JSON.stringify(data.error)
  }
  return `Server request failed with status HTTP ${res.status}`
}

/**
 * GET /api/trips
 * Fetches all trips from the backend and normalizes them for the UI.
 *
 * @returns {Promise<{ success: boolean, trips?: Array<Object>, error?: string }>}
 */
export async function fetchTrips() {
  try {
    const res = await fetch(`${getApiBaseUrl()}/trips`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    const data = await res.json().catch(() => null)

    if (!res.ok) {
      return {
        success: false,
        error: extractErrorMessage(res, data),
      }
    }

    const rawList = Array.isArray(data?.data) ? data.data : []
    const normalizedTrips = rawList.map(normalizeTrip).filter(Boolean)

    return {
      success: true,
      trips: normalizedTrips,
    }
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Unable to connect to backend server. Please ensure the backend is running.',
    }
  }
}

/**
 * GET /api/trips/:id
 * Fetches a single trip by ID.
 *
 * @param {string} id
 * @returns {Promise<{ success: boolean, trip?: Object, error?: string }>}
 */
export async function fetchTripById(id) {
  try {
    if (!id || typeof id !== 'string') {
      return { success: false, error: 'Valid trip ID is required.' }
    }

    const res = await fetch(`${getApiBaseUrl()}/trips/${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    const data = await res.json().catch(() => null)

    if (!res.ok) {
      return {
        success: false,
        error: extractErrorMessage(res, data),
      }
    }

    return {
      success: true,
      trip: normalizeTrip(data?.data),
    }
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Network error fetching trip details.',
    }
  }
}

/**
 * POST /api/trips
 * Creates a new trip document on the backend.
 *
 * @param {Object} tripData
 * @returns {Promise<{ success: boolean, trip?: Object, error?: string }>}
 */
export async function createTripApi(tripData) {
  try {
    const payload = {
      name: tripData.name?.trim() || '',
      destination: tripData.destination?.trim() || '',
      startDate: tripData.startDate || '',
      endDate: tripData.endDate || '',
      travelers: parseInt(tripData.travelers, 10) || 1,
      budget: Number(tripData.budget) || 0,
      notes: tripData.notes?.trim() || '',
    }

    const res = await fetch(`${getApiBaseUrl()}/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json().catch(() => null)

    if (!res.ok) {
      return {
        success: false,
        error: extractErrorMessage(res, data),
      }
    }

    return {
      success: true,
      trip: normalizeTrip(data?.data),
    }
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Failed to connect to backend server to create trip.',
    }
  }
}

/**
 * PATCH /api/trips/:id
 * Updates permitted fields for an existing trip on the backend.
 *
 * @param {string} id
 * @param {Object} updatedFields
 * @returns {Promise<{ success: boolean, trip?: Object, error?: string }>}
 */
export async function updateTripApi(id, updatedFields) {
  try {
    if (!id || typeof id !== 'string') {
      return { success: false, error: 'Valid trip ID is required.' }
    }

    const payload = {}
    if (updatedFields.name !== undefined) payload.name = updatedFields.name.trim()
    if (updatedFields.destination !== undefined) payload.destination = updatedFields.destination.trim()
    if (updatedFields.startDate !== undefined) payload.startDate = updatedFields.startDate
    if (updatedFields.endDate !== undefined) payload.endDate = updatedFields.endDate
    if (updatedFields.travelers !== undefined) payload.travelers = parseInt(updatedFields.travelers, 10)
    if (updatedFields.budget !== undefined) payload.budget = Number(updatedFields.budget)
    if (updatedFields.notes !== undefined) payload.notes = updatedFields.notes.trim()

    const res = await fetch(`${getApiBaseUrl()}/trips/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json().catch(() => null)

    if (!res.ok) {
      return {
        success: false,
        error: extractErrorMessage(res, data),
      }
    }

    return {
      success: true,
      trip: normalizeTrip(data?.data),
    }
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Failed to update trip on backend server.',
    }
  }
}

/**
 * DELETE /api/trips/:id
 * Deletes a trip on the backend.
 *
 * @param {string} id
 * @returns {Promise<{ success: boolean, id?: string, error?: string }>}
 */
export async function deleteTripApi(id) {
  try {
    if (!id || typeof id !== 'string') {
      return { success: false, error: 'Valid trip ID is required.' }
    }

    const res = await fetch(`${getApiBaseUrl()}/trips/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    })

    const data = await res.json().catch(() => null)

    if (!res.ok) {
      return {
        success: false,
        error: extractErrorMessage(res, data),
      }
    }

    return {
      success: true,
      id: data?.data?.id || id,
    }
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Failed to delete trip from backend server.',
    }
  }
}
