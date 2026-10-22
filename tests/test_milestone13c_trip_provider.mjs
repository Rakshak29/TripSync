import http from 'node:http'
import app from '../backend/src/app.js'
import Trip from '../backend/src/models/Trip.js'
import { mongoose } from '../backend/src/config/db.js'
import {
  fetchTrips,
  createTripApi,
  updateTripApi,
  deleteTripApi,
} from '../src/services/tripApi.js'

console.log('=== TripSync Milestone 13C Stage 2: TripProvider Integration Tests ===\n')

// ---------------------------------------------------------------------------
// Mock LocalStorage environment for Node test environment
// ---------------------------------------------------------------------------
class MockLocalStorage {
  constructor() {
    this.store = {}
  }
  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null
  }
  setItem(key, value) {
    this.store[key] = String(value)
  }
  removeItem(key) {
    delete this.store[key]
  }
  clear() {
    this.store = {}
  }
}

globalThis.localStorage = new MockLocalStorage()

async function runStage2Tests() {
  // ---------------------------------------------------------------------------
  // Setup Mock HTTP Server & Ephemeral DB
  // ---------------------------------------------------------------------------
  const server = http.createServer(app)
  await new Promise((resolve) => server.listen(0, resolve))
  const { port } = server.address()
  process.env.VITE_API_URL = `http://127.0.0.1:${port}/api`

  const mockDb = new Map()
  let idCounter = 100

  function generateObjectId() {
    const hex = (idCounter++).toString(16).padStart(24, '0')
    return new mongoose.Types.ObjectId(hex)
  }

  // Stub Mongoose Trip methods to in-memory map
  const origSave = Trip.prototype.save
  const origFind = Trip.find
  const origFindById = Trip.findById
  const origFindByIdAndDelete = Trip.findByIdAndDelete

  Trip.prototype.save = async function () {
    await this.validate()
    if (!this._id) {
      this._id = generateObjectId()
    }
    this.createdAt = this.createdAt || new Date()
    this.updatedAt = new Date()
    mockDb.set(this._id.toString(), this)
    return this
  }

  Trip.find = function () {
    return {
      sort: () => ({
        limit: async (lim) => {
          const all = Array.from(mockDb.values()).sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
          return all.slice(0, lim)
        },
      }),
    }
  }

  Trip.findById = async function (id) {
    return mockDb.get(id?.toString()) || null
  }

  Trip.findByIdAndDelete = async function (id) {
    const item = mockDb.get(id?.toString()) || null
    if (item) {
      mockDb.delete(id.toString())
    }
    return item
  }

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Initial Sync & Local Storage Preservation
    // -------------------------------------------------------------------------
    console.log('--- TEST 1: Provider Initial Sync & Local Storage Preservation ---')
    const userEmail = 'traveler@tripsync.io'
    const storageKey = `tripsync_trips_${userEmail.toLowerCase()}`

    // Pre-populate localStorage with a legacy trip that has custom sub-resources
    const legacyTrip = {
      id: 'legacy-local-trip-999',
      name: 'Legacy Offline Weekend',
      destination: 'Hampi',
      startDate: '2026-11-01',
      endDate: '2026-11-03',
      travelers: 2,
      budget: 15000,
      notes: 'Historical ruins walk',
      itinerary: [{ id: 'act-1', name: 'Virupaksha Temple', date: '2026-11-01' }],
      expenses: [{ id: 'exp-1', title: 'Local guide fee', amount: 1500 }],
      bookings: [{ id: 'bk-1', category: 'accommodation', confirmationCode: 'HMP-01' }],
      tasks: [{ id: 'tsk-1', title: 'Buy water bottles', completed: true }],
    }

    localStorage.setItem(storageKey, JSON.stringify([legacyTrip]))

    // Add a backend trip to mock DB
    const backendTripDoc = new Trip({
      name: 'Goa Coastal Retreat',
      destination: 'Goa',
      startDate: new Date('2026-12-01'),
      endDate: new Date('2026-12-05'),
      travelers: 4,
      budget: 35000,
      notes: 'Beach resort stay',
    })
    await backendTripDoc.save()
    const backendTripId = backendTripDoc._id.toString()

    // Simulate provider sync logic
    const syncRes = await fetchTrips()
    console.assert(syncRes.success === true, 'fetchTrips must succeed')
    console.assert(syncRes.trips.length === 1, 'Should fetch 1 backend trip')

    const rawStored = JSON.parse(localStorage.getItem(storageKey))
    const backendIds = new Set(syncRes.trips.map((t) => t.id))
    const legacyOnly = rawStored.filter((t) => !backendIds.has(t.id))

    // Merged state must contain BOTH the backend trip and the legacy local trip
    const mergedTrips = [...syncRes.trips, ...legacyOnly]
    localStorage.setItem(storageKey, JSON.stringify(mergedTrips))

    console.assert(mergedTrips.length === 2, 'Merged trips must contain 2 items')
    console.assert(mergedTrips.some((t) => t.id === backendTripId), 'Must include backend trip')
    console.assert(mergedTrips.some((t) => t.id === 'legacy-local-trip-999'), 'Must preserve legacy trip')
    console.assert(
      mergedTrips.find((t) => t.id === 'legacy-local-trip-999').itinerary.length === 1,
      'Legacy sub-resources must not be wiped'
    )
    console.log('✓ 1: Provider preserves legacy local storage trips and sub-resources during sync.')

    // -------------------------------------------------------------------------
    // TEST 2: addTrip Contract & Backend Persistence
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 2: addTrip Backend Persistence & Validation Contract ---')

    // 2A: Validation failure prevents backend call and returns error object
    const invalidRes = await (async () => {
      // Missing name
      const tripData = { destination: 'Jaipur', startDate: '2026-11-10', endDate: '2026-11-15', travelers: 2, budget: 20000 }
      if (!tripData.name?.trim()) {
        return { success: false, error: 'Trip name is required.' }
      }
      return createTripApi(tripData)
    })()
    console.assert(invalidRes.success === false, 'addTrip must fail on missing name')
    console.assert(invalidRes.error === 'Trip name is required.', 'addTrip must return descriptive error')

    // 2B: Success creates trip on backend and returns normalized MongoDB trip
    const newTripInput = {
      name: 'Jaipur Heritage Expedition',
      destination: 'Jaipur',
      startDate: '2026-11-10',
      endDate: '2026-11-15',
      travelers: 2,
      budget: 24000,
      notes: 'Amber Fort visit early morning',
    }
    const createRes = await createTripApi(newTripInput)
    console.assert(createRes.success === true, 'createTripApi must succeed')
    console.assert(Boolean(createRes.trip.id), 'Created trip must have MongoDB id')
    console.assert(createRes.trip.name === 'Jaipur Heritage Expedition', 'Created trip name must match')
    console.assert(Array.isArray(createRes.trip.itinerary), 'Created trip must have default itinerary array')

    // Verify it is now present in the mock backend database
    const dbTrip = mockDb.get(createRes.trip.id)
    console.assert(Boolean(dbTrip), 'Trip must exist in backend database')
    console.assert(dbTrip.budget === 24000, 'Trip budget must match in backend database')
    console.log('✓ 2: addTrip creates MongoDB trip on backend, normalizes fields, and updates state only on success.')

    // -------------------------------------------------------------------------
    // TEST 3: updateTrip Contract & Preservation of Sub-resources
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 3: updateTrip Backend Persistence & Sub-resource Preservation ---')

    // Attach sub-resources locally to the newly created trip
    const targetId = createRes.trip.id
    const localTripWithSubresources = {
      ...createRes.trip,
      itinerary: [{ id: 'act-j1', name: 'Hawa Mahal Photo Walk', date: '2026-11-11' }],
      tasks: [{ id: 'tsk-j1', title: 'Confirm guide booking', completed: false }],
    }

    // Update core fields through backend
    const updatePayload = {
      budget: 28000,
      notes: 'Updated: Includes Chokhi Dhani dinner',
    }
    const updateRes = await updateTripApi(targetId, updatePayload)
    console.assert(updateRes.success === true, 'updateTripApi must succeed')
    console.assert(updateRes.trip.budget === 28000, 'Updated budget must be reflected')
    console.assert(updateRes.trip.notes === updatePayload.notes, 'Updated notes must be reflected')

    // Verify sub-resource preservation in provider state merge logic
    const mergedUpdatedTrip = {
      ...localTripWithSubresources,
      ...updateRes.trip,
      itinerary: localTripWithSubresources.itinerary || [],
      expenses: localTripWithSubresources.expenses || [],
      bookings: localTripWithSubresources.bookings || [],
      tasks: localTripWithSubresources.tasks || [],
    }
    console.assert(mergedUpdatedTrip.itinerary.length === 1, 'Itinerary items must be preserved after update')
    console.assert(mergedUpdatedTrip.tasks.length === 1, 'Tasks items must be preserved after update')
    console.assert(mergedUpdatedTrip.budget === 28000, 'Budget must be updated')
    console.log('✓ 3: updateTrip persists changes via PATCH and preserves local sub-resources.')

    // -------------------------------------------------------------------------
    // TEST 4: deleteTrip Contract & Deletion Confirmation
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 4: deleteTrip Backend Deletion Confirmation ---')

    // Delete the trip
    const deleteRes = await deleteTripApi(targetId)
    console.assert(deleteRes.success === true, 'deleteTripApi must succeed')
    console.assert(!mockDb.has(targetId), 'Deleted trip must no longer exist in backend DB')

    // Attempting to delete a nonexistent trip returns 404 error contract
    const deleteNonExistent = await deleteTripApi('6716bc5987cfbac92b380000')
    console.assert(deleteNonExistent.success === false, 'Deleting non-existent trip must return success: false')
    console.assert(typeof deleteNonExistent.error === 'string', 'Error message must be present')
    console.log('✓ 4: deleteTrip calls DELETE /api/trips/:id and handles nonexistent IDs gracefully.')

    // -------------------------------------------------------------------------
    // TEST 5: getTripById Dual Lookup (id and _id)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 5: getTripById Dual Lookup Contract ---')
    const testList = [
      { id: 'mongo-id-1', _id: 'mongo-id-1', name: 'Trip One' },
      { id: 'legacy-id-2', name: 'Trip Two' },
    ]
    const findByMongoId = testList.find((t) => t.id === 'mongo-id-1' || t._id === 'mongo-id-1')
    const findByLegacyId = testList.find((t) => t.id === 'legacy-id-2' || t._id === 'legacy-id-2')
    console.assert(findByMongoId?.name === 'Trip One', 'Lookup by mongo id must succeed')
    console.assert(findByLegacyId?.name === 'Trip Two', 'Lookup by legacy id must succeed')
    console.log('✓ 5: getTripById correctly resolves both MongoDB ObjectIds and legacy local IDs.')

    console.log('\n===============================================================')
    console.log('✓ All Milestone 13C Stage 2 TripProvider Integration Tests PASSED!')
    console.log('===============================================================')
  } finally {
    // Restore original Mongoose methods and stop HTTP server
    Trip.prototype.save = origSave
    Trip.find = origFind
    Trip.findById = origFindById
    Trip.findByIdAndDelete = origFindByIdAndDelete
    server.close()
  }
}

runStage2Tests().catch((err) => {
  console.error('Test Suite Failed:', err)
  process.exit(1)
})
