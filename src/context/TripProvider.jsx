import { useState, useEffect, useCallback } from 'react'
import { TripContext } from './tripContext'
import { useAuth } from './authContext'
import { validateBookingData, validateTaskData } from '../utils/tripUtils'
import {
  fetchTrips,
  createTripApi,
  updateTripApi,
  deleteTripApi,
} from '../services/tripApi'

/**
 * Validates and loads stored trips from localStorage.
 *
 * @param {string} storageKey
 * @returns {Array<Object>}
 */
function loadStoredTrips(storageKey) {
  try {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        return parsed
          .filter(
            (item) =>
              item &&
              typeof item === 'object' &&
              Boolean(item.id) &&
              typeof item.name === 'string' &&
              typeof item.destination === 'string' &&
              typeof item.startDate === 'string' &&
              typeof item.endDate === 'string' &&
              typeof item.travelers === 'number'
          )
          .map((item) => ({
            ...item,
            itinerary: Array.isArray(item.itinerary)
              ? item.itinerary.filter(
                  (act) =>
                    act &&
                    typeof act === 'object' &&
                    Boolean(act.id) &&
                    typeof act.name === 'string'
                )
              : [],
            expenses: Array.isArray(item.expenses)
              ? item.expenses.filter(
                  (exp) =>
                    exp &&
                    typeof exp === 'object' &&
                    Boolean(exp.id) &&
                    typeof exp.title === 'string' &&
                    typeof exp.amount === 'number'
                )
              : [],
            bookings: Array.isArray(item.bookings)
              ? item.bookings
                  .filter((bk) => bk && typeof bk === 'object' && Boolean(bk.id))
                  .map((bk) => {
                    let cat = (bk.category || '').toLowerCase().trim()
                    if (!cat) {
                      if (bk.transportType) cat = 'transport'
                      else if (bk.reservationDateTime) cat = 'activity'
                      else cat = 'accommodation'
                    }
                    return {
                      ...bk,
                      category: cat,
                    }
                  })
              : [],
            tasks: Array.isArray(item.tasks)
              ? item.tasks
                  .filter((t) => t && typeof t === 'object' && Boolean(t.id))
                  .map((t) => ({
                    id: t.id,
                    title: typeof t.title === 'string' ? t.title : '',
                    dueDate: typeof t.dueDate === 'string' ? t.dueDate : '',
                    description:
                      typeof t.description === 'string'
                        ? t.description
                        : typeof t.notes === 'string'
                        ? t.notes
                        : '',
                    completed: Boolean(t.completed),
                    createdAt:
                      typeof t.createdAt === 'string'
                        ? t.createdAt
                        : new Date().toISOString(),
                    updatedAt:
                      typeof t.updatedAt === 'string'
                        ? t.updatedAt
                        : new Date().toISOString(),
                  }))
              : [],
          }))
      }
    }
    return []
  } catch {
    return []
  }
}

/**
 * Trip Provider for TripSync.
 * Manages persistent user trips scoped to the signed-in user's email via localStorage.
 */
export function TripProvider({ children }) {
  const { user } = useAuth()
  const storageKey = user?.email
    ? `tripsync_trips_${user.email.toLowerCase()}`
    : 'tripsync_trips_guest'

  const [prevStorageKey, setPrevStorageKey] = useState(storageKey)
  const [trips, setTrips] = useState(() => loadStoredTrips(storageKey))
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState(null)

  // Adjust state during render when switching user accounts
  if (storageKey !== prevStorageKey) {
    setPrevStorageKey(storageKey)
    setTrips(loadStoredTrips(storageKey))
  }

  // Persist trips to localStorage
  const saveTrips = useCallback(
    (newTrips) => {
      setTrips(newTrips)
      try {
        localStorage.setItem(storageKey, JSON.stringify(newTrips))
      } catch {
        // Fallback gracefully if storage quota exceeded or unavailable
      }
    },
    [storageKey]
  )

  // Load trips from GET /api/trips on initialization or user account switch
  useEffect(() => {
    let isMounted = true

    async function loadTrips() {
      setIsLoading(true)
      setApiError(null)

      try {
        const res = await fetchTrips()
        if (!isMounted) return

        if (res.success && Array.isArray(res.trips)) {
          // Preserve any existing local trips from localStorage that are not on the backend
          const storedLocal = loadStoredTrips(storageKey)
          const backendIds = new Set(res.trips.map((t) => t.id))
          const legacyOnly = storedLocal.filter((t) => !backendIds.has(t.id))

          // Merge sub-resources (itinerary, bookings, tasks, expenses) from cached state if available
          const localMap = new Map(storedLocal.map((t) => [t.id, t]))
          const mergedBackend = res.trips.map((bTrip) => {
            const cached = localMap.get(bTrip.id)
            if (cached) {
              return {
                ...bTrip,
                itinerary: cached.itinerary?.length ? cached.itinerary : bTrip.itinerary,
                expenses: cached.expenses?.length ? cached.expenses : bTrip.expenses,
                bookings: cached.bookings?.length ? cached.bookings : bTrip.bookings,
                tasks: cached.tasks?.length ? cached.tasks : bTrip.tasks,
              }
            }
            return bTrip
          })

          const combined = [...mergedBackend, ...legacyOnly]
          setTrips(combined)
          try {
            localStorage.setItem(storageKey, JSON.stringify(combined))
          } catch {
            // ignore
          }
        } else if (!res.success) {
          setApiError(res.error || 'Failed to load trips from backend.')
        }
      } catch (err) {
        if (!isMounted) return
        setApiError(err.message || 'Network error fetching trips.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadTrips()

    return () => {
      isMounted = false
    }
  }, [storageKey])

  /**
   * Manual refresh helper to re-sync trips from backend.
   */
  const refreshTrips = useCallback(async () => {
    setIsLoading(true)
    setApiError(null)
    try {
      const res = await fetchTrips()
      if (res.success && Array.isArray(res.trips)) {
        const storedLocal = loadStoredTrips(storageKey)
        const backendIds = new Set(res.trips.map((t) => t.id))
        const legacyOnly = storedLocal.filter((t) => !backendIds.has(t.id))
        const combined = [...res.trips, ...legacyOnly]
        setTrips(combined)
        try {
          localStorage.setItem(storageKey, JSON.stringify(combined))
        } catch {
          // ignore
        }
      }
    } catch (err) {
      setApiError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [storageKey])

  /**
   * Add a new trip via backend API.
   * Updates state and cache only after confirmed success.
   *
   * @param {Object} tripData
   * @returns {Promise<{ success: boolean, trip?: Object, error?: string }>}
   */
  const addTrip = async (tripData) => {
    const name = tripData.name?.trim() || ''
    const destination = tripData.destination?.trim() || ''
    const startDate = tripData.startDate || ''
    const endDate = tripData.endDate || ''
    const travelers = parseInt(tripData.travelers, 10)
    const rawBudget = tripData.budget
    const numBudget = Number(rawBudget)
    const notes = tripData.notes?.trim() || ''

    if (!name) {
      return { success: false, error: 'Trip name is required.' }
    }
    if (!destination) {
      return { success: false, error: 'Destination is required.' }
    }
    if (!startDate) {
      return { success: false, error: 'Start date is required.' }
    }
    if (!endDate) {
      return { success: false, error: 'End date is required.' }
    }
    if (endDate < startDate) {
      return { success: false, error: 'End date cannot be earlier than start date.' }
    }
    if (isNaN(travelers) || travelers < 1) {
      return { success: false, error: 'At least 1 traveler is required.' }
    }
    if (travelers > 50) {
      return { success: false, error: 'Traveler count cannot exceed 50.' }
    }
    if (
      rawBudget === '' ||
      rawBudget === null ||
      rawBudget === undefined ||
      isNaN(numBudget) ||
      numBudget <= 0
    ) {
      return {
        success: false,
        error: 'Total estimated budget is required and must be greater than zero.',
      }
    }

    try {
      const res = await createTripApi({
        name,
        destination,
        startDate,
        endDate,
        travelers,
        budget: numBudget,
        notes,
      })

      if (!res.success || !res.trip) {
        return {
          success: false,
          error: res.error || 'Failed to save trip to backend.',
        }
      }

      const createdTrip = res.trip
      const updated = [createdTrip, ...trips]
      saveTrips(updated)

      return { success: true, trip: createdTrip }
    } catch (err) {
      return {
        success: false,
        error: err.message || 'An unexpected error occurred while saving the trip.',
      }
    }
  }

  /**
   * Update an existing trip via backend API.
   * Updates state and cache only after confirmed success.
   *
   * @param {string} id
   * @param {Object} updatedFields
   * @returns {Promise<{ success: boolean, trip?: Object, error?: string }>}
   */
  const updateTrip = async (id, updatedFields) => {
    const existing = trips.find((t) => t.id === id || t._id === id)
    if (!existing) {
      return { success: false, error: 'Trip not found.' }
    }

    const name = updatedFields.name !== undefined ? updatedFields.name.trim() : existing.name
    const destination =
      updatedFields.destination !== undefined
        ? updatedFields.destination.trim()
        : existing.destination
    const startDate = updatedFields.startDate || existing.startDate
    const endDate = updatedFields.endDate || existing.endDate
    const travelers =
      updatedFields.travelers !== undefined
        ? parseInt(updatedFields.travelers, 10)
        : existing.travelers
    const rawBudget = updatedFields.budget
    let budget = existing.budget
    if (rawBudget !== undefined) {
      const numBudget = Number(rawBudget)
      if (rawBudget === '' || rawBudget === null || isNaN(numBudget) || numBudget <= 0) {
        return {
          success: false,
          error: 'Total estimated budget is required and must be greater than zero.',
        }
      }
      budget = numBudget
    }

    const notes =
      updatedFields.notes !== undefined ? updatedFields.notes.trim() : existing.notes

    if (!name) {
      return { success: false, error: 'Trip name cannot be empty.' }
    }
    if (!destination) {
      return { success: false, error: 'Destination cannot be empty.' }
    }
    if (!startDate || !endDate) {
      return { success: false, error: 'Start and end dates are required.' }
    }
    if (endDate < startDate) {
      return { success: false, error: 'End date cannot be earlier than start date.' }
    }
    if (isNaN(travelers) || travelers < 1) {
      return { success: false, error: 'At least 1 traveler is required.' }
    }
    if (travelers > 50) {
      return { success: false, error: 'Traveler count cannot exceed 50.' }
    }

    try {
      const res = await updateTripApi(id, {
        name,
        destination,
        startDate,
        endDate,
        travelers,
        budget,
        notes,
      })

      if (!res.success || !res.trip) {
        return {
          success: false,
          error: res.error || 'Failed to update trip on backend.',
        }
      }

      const updatedTrip = {
        ...existing,
        ...res.trip,
        itinerary: existing.itinerary || [],
        expenses: existing.expenses || [],
        bookings: existing.bookings || [],
        tasks: existing.tasks || [],
      }

      const updated = trips.map((trip) =>
        trip.id === id || trip._id === id ? updatedTrip : trip
      )
      saveTrips(updated)

      return { success: true, trip: updatedTrip }
    } catch (err) {
      return {
        success: false,
        error: err.message || 'An unexpected error occurred while updating the trip.',
      }
    }
  }

  /**
   * Delete a trip by id via backend API.
   * Removes from state and cache only after confirmed success.
   *
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  const deleteTrip = async (id) => {
    try {
      const res = await deleteTripApi(id)
      if (!res.success) {
        return {
          success: false,
          error: res.error || 'Failed to delete trip from backend.',
        }
      }

      const updated = trips.filter((trip) => trip.id !== id && trip._id !== id)
      saveTrips(updated)
      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: err.message || 'An unexpected error occurred while deleting the trip.',
      }
    }
  }

  /**
   * Find a trip by ID.
   *
   * @param {string} id
   * @returns {Object|null}
   */
  const getTripById = (id) => {
    return trips.find((trip) => trip.id === id || trip._id === id) || null
  }

  /**
   * Add an activity to a trip's itinerary.
   *
   * @param {string} tripId
   * @param {Object} activityData - { name, date, time?, location?, notes? }
   * @returns {{ success: boolean, activity?: Object, error?: string }}
   */
  const addActivity = (tripId, activityData) => {
    const name = activityData.name?.trim() || ''
    const date = activityData.date?.trim() || ''
    const time = activityData.time?.trim() || ''
    const location = activityData.location?.trim() || ''
    const notes = activityData.notes?.trim() || ''

    if (!name) {
      return { success: false, error: 'Activity name is required.' }
    }
    if (!date) {
      return { success: false, error: 'Activity date is required.' }
    }

    const existingTrip = trips.find((t) => t.id === tripId)
    if (!existingTrip) {
      return { success: false, error: 'Trip not found.' }
    }

    const newActivity = {
      id: 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      date,
      name,
      time,
      location,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const currentItinerary = Array.isArray(existingTrip.itinerary)
      ? existingTrip.itinerary
      : []
    const updatedItinerary = [...currentItinerary, newActivity]

    const updatedTrips = trips.map((t) => {
      if (t.id === tripId) {
        return {
          ...t,
          itinerary: updatedItinerary,
          updatedAt: new Date().toISOString(),
        }
      }
      return t
    })

    saveTrips(updatedTrips)
    return { success: true, activity: newActivity }
  }

  /**
   * Update an existing activity in a trip's itinerary.
   *
   * @param {string} tripId
   * @param {string} activityId
   * @param {Object} updatedFields - { name?, date?, time?, location?, notes? }
   * @returns {{ success: boolean, activity?: Object, error?: string }}
   */
  const updateActivity = (tripId, activityId, updatedFields) => {
    const name = updatedFields.name !== undefined ? updatedFields.name.trim() : null
    if (name !== null && !name) {
      return { success: false, error: 'Activity name is required.' }
    }

    const existingTrip = trips.find((t) => t.id === tripId)
    if (!existingTrip) {
      return { success: false, error: 'Trip not found.' }
    }

    const currentItinerary = Array.isArray(existingTrip.itinerary)
      ? existingTrip.itinerary
      : []
    const existingAct = currentItinerary.find((a) => a.id === activityId)
    if (!existingAct) {
      return { success: false, error: 'Activity not found.' }
    }

    let updatedActResult = null
    const updatedItinerary = currentItinerary.map((act) => {
      if (act.id === activityId) {
        updatedActResult = {
          ...act,
          name: name !== null ? name : act.name,
          date:
            updatedFields.date !== undefined
              ? updatedFields.date.trim()
              : act.date,
          time:
            updatedFields.time !== undefined
              ? updatedFields.time.trim()
              : act.time,
          location:
            updatedFields.location !== undefined
              ? updatedFields.location.trim()
              : act.location,
          notes:
            updatedFields.notes !== undefined
              ? updatedFields.notes.trim()
              : act.notes,
          updatedAt: new Date().toISOString(),
        }
        return updatedActResult
      }
      return act
    })

    const updatedTrips = trips.map((t) => {
      if (t.id === tripId) {
        return {
          ...t,
          itinerary: updatedItinerary,
          updatedAt: new Date().toISOString(),
        }
      }
      return t
    })

    saveTrips(updatedTrips)
    return { success: true, activity: updatedActResult }
  }

  /**
   * Delete an activity from a trip's itinerary.
   *
   * @param {string} tripId
   * @param {string} activityId
   * @returns {{ success: boolean }}
   */
  const deleteActivity = (tripId, activityId) => {
    const existingTrip = trips.find((t) => t.id === tripId)
    if (!existingTrip) {
      return { success: false, error: 'Trip not found.' }
    }

    const currentItinerary = Array.isArray(existingTrip.itinerary)
      ? existingTrip.itinerary
      : []
    const updatedItinerary = currentItinerary.filter((a) => a.id !== activityId)

    const updatedTrips = trips.map((t) => {
      if (t.id === tripId) {
        return {
          ...t,
          itinerary: updatedItinerary,
          updatedAt: new Date().toISOString(),
        }
      }
      return t
    })

    saveTrips(updatedTrips)
    return { success: true }
  }

  /**
   * Add an expense to a trip's expense list.
   *
   * @param {string} tripId
   * @param {Object} expenseData - { title, amount, category, date, notes? }
   * @returns {{ success: boolean, expense?: Object, error?: string }}
   */
  const addExpense = (tripId, expenseData) => {
    const title = expenseData.title?.trim() || ''
    const rawAmount = expenseData.amount
    const numAmount = Number(rawAmount)
    const category = expenseData.category?.trim() || 'Other'
    const date = expenseData.date?.trim() || ''
    const notes = expenseData.notes?.trim() || ''

    if (!title) {
      return { success: false, error: 'Expense title is required.' }
    }
    if (
      rawAmount === '' ||
      rawAmount === null ||
      rawAmount === undefined ||
      isNaN(numAmount) ||
      numAmount <= 0
    ) {
      return { success: false, error: 'Amount is required and must be greater than zero.' }
    }
    if (!date) {
      return { success: false, error: 'Expense date is required.' }
    }

    const existingTrip = trips.find((t) => t.id === tripId)
    if (!existingTrip) {
      return { success: false, error: 'Trip not found.' }
    }

    const newExpense = {
      id: 'exp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title,
      amount: numAmount,
      category,
      date,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const currentExpenses = Array.isArray(existingTrip.expenses) ? existingTrip.expenses : []
    const updatedExpenses = [newExpense, ...currentExpenses]

    const updatedTrips = trips.map((t) => {
      if (t.id === tripId) {
        return {
          ...t,
          expenses: updatedExpenses,
          updatedAt: new Date().toISOString(),
        }
      }
      return t
    })

    saveTrips(updatedTrips)
    return { success: true, expense: newExpense }
  }

  /**
   * Update an existing expense in a trip.
   *
   * @param {string} tripId
   * @param {string} expenseId
   * @param {Object} updatedFields - { title?, amount?, category?, date?, notes? }
   * @returns {{ success: boolean, expense?: Object, error?: string }}
   */
  const updateExpense = (tripId, expenseId, updatedFields) => {
    const title = updatedFields.title !== undefined ? updatedFields.title.trim() : null
    if (title !== null && !title) {
      return { success: false, error: 'Expense title is required.' }
    }

    let numAmount = null
    if (updatedFields.amount !== undefined) {
      numAmount = Number(updatedFields.amount)
      if (
        updatedFields.amount === '' ||
        updatedFields.amount === null ||
        isNaN(numAmount) ||
        numAmount <= 0
      ) {
        return { success: false, error: 'Amount is required and must be greater than zero.' }
      }
    }

    const date = updatedFields.date !== undefined ? updatedFields.date.trim() : null
    if (date !== null && !date) {
      return { success: false, error: 'Expense date is required.' }
    }

    const existingTrip = trips.find((t) => t.id === tripId)
    if (!existingTrip) {
      return { success: false, error: 'Trip not found.' }
    }

    const currentExpenses = Array.isArray(existingTrip.expenses) ? existingTrip.expenses : []
    const existingExp = currentExpenses.find((e) => e.id === expenseId)
    if (!existingExp) {
      return { success: false, error: 'Expense not found.' }
    }

    let updatedExpResult = null
    const updatedExpenses = currentExpenses.map((exp) => {
      if (exp.id === expenseId) {
        updatedExpResult = {
          ...exp,
          title: title !== null ? title : exp.title,
          amount: numAmount !== null ? numAmount : exp.amount,
          category:
            updatedFields.category !== undefined
              ? updatedFields.category.trim()
              : exp.category,
          date: date !== null ? date : exp.date,
          notes:
            updatedFields.notes !== undefined
              ? updatedFields.notes.trim()
              : exp.notes,
          updatedAt: new Date().toISOString(),
        }
        return updatedExpResult
      }
      return exp
    })

    const updatedTrips = trips.map((t) => {
      if (t.id === tripId) {
        return {
          ...t,
          expenses: updatedExpenses,
          updatedAt: new Date().toISOString(),
        }
      }
      return t
    })

    saveTrips(updatedTrips)
    return { success: true, expense: updatedExpResult }
  }

  /**
   * Delete an expense from a trip.
   *
   * @param {string} tripId
   * @param {string} expenseId
   * @returns {{ success: boolean }}
   */
  const deleteExpense = (tripId, expenseId) => {
    const existingTrip = trips.find((t) => t.id === tripId)
    if (!existingTrip) {
      return { success: false, error: 'Trip not found.' }
    }

    const currentExpenses = Array.isArray(existingTrip.expenses) ? existingTrip.expenses : []
    const updatedExpenses = currentExpenses.filter((e) => e.id !== expenseId)

    const updatedTrips = trips.map((t) => {
      if (t.id === tripId) {
        return {
          ...t,
          expenses: updatedExpenses,
          updatedAt: new Date().toISOString(),
        }
      }
      return t
    })

    saveTrips(updatedTrips)
    return { success: true }
  }

  /**
   * Add a booking or travel record to a trip.
   *
   * @param {string} tripId
   * @param {Object} bookingData
   * @returns {{ success: boolean, booking?: Object, error?: string }}
   */
  const addBooking = (tripId, bookingData) => {
    const validation = validateBookingData(bookingData)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    const existingTrip = trips.find((t) => t.id === tripId)
    if (!existingTrip) {
      return { success: false, error: 'Trip not found.' }
    }

    const category = (bookingData.category || 'accommodation').toLowerCase().trim()
    const newBooking = {
      id: 'bk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      category,
      // Accommodation & Activity name or Transport default title
      name:
        category === 'transport'
          ? (bookingData.name?.trim() ||
              `${bookingData.transportType || 'Transport'}${bookingData.operator ? ' • ' + bookingData.operator.trim() : ''}`)
          : (bookingData.name || bookingData.propertyName || '').trim(),
      location: (bookingData.location || bookingData.address || '').trim(),
      checkInDate: (bookingData.checkInDate || '').trim(),
      checkOutDate: (bookingData.checkOutDate || '').trim(),
      bookingRef: (bookingData.bookingRef || bookingData.reference || '').trim(),
      contactNumber: (bookingData.contactNumber || bookingData.contact || '').trim(),
      // Transport fields
      transportType: (bookingData.transportType || '').trim(),
      operator: (bookingData.operator || '').trim(),
      departureLocation: (bookingData.departureLocation || '').trim(),
      arrivalLocation: (bookingData.arrivalLocation || '').trim(),
      departureDateTime: (bookingData.departureDateTime || '').trim(),
      arrivalDateTime: (bookingData.arrivalDateTime || '').trim(),
      // Activity / General fields
      contactInfo: (bookingData.contactInfo || bookingData.contact || '').trim(),
      reservationDateTime: (bookingData.reservationDateTime || '').trim(),
      notes: (bookingData.notes || '').trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const currentBookings = Array.isArray(existingTrip.bookings) ? existingTrip.bookings : []
    const updatedBookings = [newBooking, ...currentBookings]

    const updatedTrips = trips.map((t) => {
      if (t.id === tripId) {
        return {
          ...t,
          bookings: updatedBookings,
          updatedAt: new Date().toISOString(),
        }
      }
      return t
    })

    saveTrips(updatedTrips)
    return { success: true, booking: newBooking }
  }

  /**
   * Update an existing booking in a trip.
   *
   * @param {string} tripId
   * @param {string} bookingId
   * @param {Object} updatedFields
   * @returns {{ success: boolean, booking?: Object, error?: string }}
   */
  const updateBooking = (tripId, bookingId, updatedFields) => {
    const existingTrip = trips.find((t) => t.id === tripId)
    if (!existingTrip) {
      return { success: false, error: 'Trip not found.' }
    }

    const currentBookings = Array.isArray(existingTrip.bookings) ? existingTrip.bookings : []
    const existingBk = currentBookings.find((b) => b.id === bookingId)
    if (!existingBk) {
      return { success: false, error: 'Booking not found.' }
    }

    const mergedData = { ...existingBk, ...updatedFields }
    const validation = validateBookingData(mergedData)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    let updatedBkResult = null
    const updatedBookings = currentBookings.map((bk) => {
      if (bk.id === bookingId) {
        const cat = (updatedFields.category !== undefined ? updatedFields.category : bk.category || 'accommodation').toLowerCase().trim()
        updatedBkResult = {
          ...bk,
          category: cat,
          name:
            updatedFields.name !== undefined
              ? updatedFields.name.trim()
              : (cat === 'transport' && (updatedFields.transportType || updatedFields.operator))
              ? `${updatedFields.transportType || bk.transportType || 'Transport'}${
                  (updatedFields.operator !== undefined ? updatedFields.operator : bk.operator)
                    ? ' • ' + (updatedFields.operator !== undefined ? updatedFields.operator.trim() : bk.operator.trim())
                    : ''
                }`
              : (bk.name || bk.propertyName || ''),
          location: updatedFields.location !== undefined ? updatedFields.location.trim() : (bk.location || bk.address || ''),
          checkInDate: updatedFields.checkInDate !== undefined ? updatedFields.checkInDate.trim() : (bk.checkInDate || ''),
          checkOutDate: updatedFields.checkOutDate !== undefined ? updatedFields.checkOutDate.trim() : (bk.checkOutDate || ''),
          bookingRef: updatedFields.bookingRef !== undefined ? updatedFields.bookingRef.trim() : (bk.bookingRef || bk.reference || ''),
          contactNumber: updatedFields.contactNumber !== undefined ? updatedFields.contactNumber.trim() : (bk.contactNumber || bk.contact || ''),
          transportType: updatedFields.transportType !== undefined ? updatedFields.transportType.trim() : (bk.transportType || ''),
          operator: updatedFields.operator !== undefined ? updatedFields.operator.trim() : (bk.operator || ''),
          departureLocation: updatedFields.departureLocation !== undefined ? updatedFields.departureLocation.trim() : (bk.departureLocation || ''),
          arrivalLocation: updatedFields.arrivalLocation !== undefined ? updatedFields.arrivalLocation.trim() : (bk.arrivalLocation || ''),
          departureDateTime: updatedFields.departureDateTime !== undefined ? updatedFields.departureDateTime.trim() : (bk.departureDateTime || ''),
          arrivalDateTime: updatedFields.arrivalDateTime !== undefined ? updatedFields.arrivalDateTime.trim() : (bk.arrivalDateTime || ''),
          contactInfo: updatedFields.contactInfo !== undefined ? updatedFields.contactInfo.trim() : (bk.contactInfo || bk.contact || ''),
          reservationDateTime: updatedFields.reservationDateTime !== undefined ? updatedFields.reservationDateTime.trim() : (bk.reservationDateTime || ''),
          notes: updatedFields.notes !== undefined ? updatedFields.notes.trim() : (bk.notes || ''),
          updatedAt: new Date().toISOString(),
        }
        return updatedBkResult
      }
      return bk
    })

    const updatedTrips = trips.map((t) => {
      if (t.id === tripId) {
        return {
          ...t,
          bookings: updatedBookings,
          updatedAt: new Date().toISOString(),
        }
      }
      return t
    })

    saveTrips(updatedTrips)
    return { success: true, booking: updatedBkResult }
  }

  /**
   * Delete a booking from a trip.
   *
   * @param {string} tripId
   * @param {string} bookingId
   * @returns {{ success: boolean }}
   */
  const deleteBooking = (tripId, bookingId) => {
    const existingTrip = trips.find((t) => t.id === tripId)
    if (!existingTrip) {
      return { success: false, error: 'Trip not found.' }
    }

    const currentBookings = Array.isArray(existingTrip.bookings) ? existingTrip.bookings : []
    const updatedBookings = currentBookings.filter((b) => b.id !== bookingId)

    const updatedTrips = trips.map((t) => {
      if (t.id === tripId) {
        return {
          ...t,
          bookings: updatedBookings,
          updatedAt: new Date().toISOString(),
        }
      }
      return t
    })

    saveTrips(updatedTrips)
    return { success: true }
  }

  /**
   * Add a to-do task to a trip.
   *
   * @param {string} tripId
   * @param {Object} taskData - { title, dueDate?, description?, notes?, completed? }
   * @returns {{ success: boolean, task?: Object, error?: string }}
   */
  const addTask = (tripId, taskData) => {
    const validation = validateTaskData(taskData)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    const existingTrip = trips.find((t) => t.id === tripId)
    if (!existingTrip) {
      return { success: false, error: 'Trip not found.' }
    }

    const newTask = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: taskData.title.trim(),
      dueDate: (taskData.dueDate || '').trim(),
      description: (taskData.description || taskData.notes || '').trim(),
      completed: Boolean(taskData.completed),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const currentTasks = Array.isArray(existingTrip.tasks) ? existingTrip.tasks : []
    const updatedTasks = [...currentTasks, newTask]

    const updatedTrips = trips.map((t) => {
      if (t.id === tripId) {
        return {
          ...t,
          tasks: updatedTasks,
          updatedAt: new Date().toISOString(),
        }
      }
      return t
    })

    saveTrips(updatedTrips)
    return { success: true, task: newTask }
  }

  /**
   * Update an existing task in a trip.
   *
   * @param {string} tripId
   * @param {string} taskId
   * @param {Object} updatedFields - { title?, dueDate?, description?, notes?, completed? }
   * @returns {{ success: boolean, task?: Object, error?: string }}
   */
  const updateTask = (tripId, taskId, updatedFields) => {
    const existingTrip = trips.find((t) => t.id === tripId)
    if (!existingTrip) {
      return { success: false, error: 'Trip not found.' }
    }

    const currentTasks = Array.isArray(existingTrip.tasks) ? existingTrip.tasks : []
    const existingTask = currentTasks.find((t) => t.id === taskId)
    if (!existingTask) {
      return { success: false, error: 'Task not found.' }
    }

    let title = existingTask.title
    if (updatedFields.title !== undefined) {
      title = updatedFields.title.trim()
      if (!title) {
        return { success: false, error: 'Task title is required.' }
      }
    }

    let updatedTaskResult = null
    const updatedTasks = currentTasks.map((t) => {
      if (t.id === taskId) {
        updatedTaskResult = {
          ...t,
          title,
          dueDate:
            updatedFields.dueDate !== undefined
              ? updatedFields.dueDate.trim()
              : t.dueDate,
          description:
            updatedFields.description !== undefined
              ? updatedFields.description.trim()
              : updatedFields.notes !== undefined
              ? updatedFields.notes.trim()
              : t.description,
          completed:
            updatedFields.completed !== undefined
              ? Boolean(updatedFields.completed)
              : t.completed,
          updatedAt: new Date().toISOString(),
        }
        return updatedTaskResult
      }
      return t
    })

    const updatedTrips = trips.map((t) => {
      if (t.id === tripId) {
        return {
          ...t,
          tasks: updatedTasks,
          updatedAt: new Date().toISOString(),
        }
      }
      return t
    })

    saveTrips(updatedTrips)
    return { success: true, task: updatedTaskResult }
  }

  /**
   * Toggle task completion status.
   *
   * @param {string} tripId
   * @param {string} taskId
   * @returns {{ success: boolean, task?: Object, error?: string }}
   */
  const toggleTask = (tripId, taskId) => {
    const existingTrip = trips.find((t) => t.id === tripId)
    if (!existingTrip) {
      return { success: false, error: 'Trip not found.' }
    }

    const currentTasks = Array.isArray(existingTrip.tasks) ? existingTrip.tasks : []
    const existingTask = currentTasks.find((t) => t.id === taskId)
    if (!existingTask) {
      return { success: false, error: 'Task not found.' }
    }

    return updateTask(tripId, taskId, { completed: !existingTask.completed })
  }

  /**
   * Delete a task from a trip.
   *
   * @param {string} tripId
   * @param {string} taskId
   * @returns {{ success: boolean }}
   */
  const deleteTask = (tripId, taskId) => {
    const existingTrip = trips.find((t) => t.id === tripId)
    if (!existingTrip) {
      return { success: false, error: 'Trip not found.' }
    }

    const currentTasks = Array.isArray(existingTrip.tasks) ? existingTrip.tasks : []
    const updatedTasks = currentTasks.filter((t) => t.id !== taskId)

    const updatedTrips = trips.map((t) => {
      if (t.id === tripId) {
        return {
          ...t,
          tasks: updatedTasks,
          updatedAt: new Date().toISOString(),
        }
      }
      return t
    })

    saveTrips(updatedTrips)
    return { success: true }
  }

  /**
   * Update Additional Notes for a trip directly.
   *
   * @param {string} tripId
   * @param {string} notes
   * @returns {{ success: boolean, trip?: Object, error?: string }}
   */
  const updateTripNotes = (tripId, notes) => {
    return updateTrip(tripId, { notes: typeof notes === 'string' ? notes : '' })
  }

  return (
    <TripContext.Provider
      value={{
        trips,
        totalTrips: trips.length,
        isLoading,
        apiError,
        refreshTrips,
        addTrip,
        updateTrip,
        updateTripNotes,
        deleteTrip,
        getTripById,
        addActivity,
        updateActivity,
        deleteActivity,
        addExpense,
        updateExpense,
        deleteExpense,
        addBooking,
        updateBooking,
        deleteBooking,
        addTask,
        updateTask,
        toggleTask,
        deleteTask,
      }}
    >
      {children}
    </TripContext.Provider>
  )
}

export default TripProvider
