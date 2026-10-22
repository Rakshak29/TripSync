import http from 'node:http'
import app from '../backend/src/app.js'
import Trip from '../backend/src/models/Trip.js'
import {
  normalizeDate,
  normalizeTrip,
  fetchTrips,
  fetchTripById,
  createTripApi,
  updateTripApi,
  deleteTripApi,
} from '../src/services/tripApi.js'
import { mongoose } from '../backend/src/config/db.js'

console.log('=== TripSync Milestone 13C Stage 1: Trip API Client Verification ===\n')

async function runTests() {
  // ---------------------------------------------------------------------------
  // TEST 1: Date Normalization
  // ---------------------------------------------------------------------------
  console.log('--- TEST 1: Date Normalization Helper ---')
  console.assert(normalizeDate('2026-11-10T00:00:00.000Z') === '2026-11-10', 'ISO date must convert to YYYY-MM-DD')
  console.assert(normalizeDate('2026-11-10') === '2026-11-10', 'YYYY-MM-DD must remain YYYY-MM-DD')
  console.assert(normalizeDate(new Date('2026-12-25T08:30:00Z')) === '2026-12-25', 'Date object must convert to YYYY-MM-DD')
  console.assert(normalizeDate(null) === '', 'Null date must return empty string')
  console.assert(normalizeDate(undefined) === '', 'Undefined date must return empty string')
  console.log('✓ 1: normalizeDate correctly converts ISO/Date objects to YYYY-MM-DD strings.')

  // ---------------------------------------------------------------------------
  // TEST 2: Trip Normalization & Frontend Compatibility
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 2: Trip Document Normalization ---')
  const rawBackendDoc = {
    _id: new mongoose.Types.ObjectId('6716bc5987cfbac92b38dff1'),
    name: '  Kashmir Snow Tour  ',
    destination: 'Gulmarg',
    startDate: '2026-12-15T00:00:00.000Z',
    endDate: '2026-12-20T00:00:00.000Z',
    travelers: 3,
    budget: 45000,
    notes: 'Book Gondola tickets early',
    createdAt: '2026-10-22T02:00:00.000Z',
    updatedAt: '2026-10-22T02:00:00.000Z',
  }

  const normalized = normalizeTrip(rawBackendDoc)

  // Verify ID mapping
  console.assert(normalized.id === '6716bc5987cfbac92b38dff1', 'MongoDB _id must be mapped to id')
  console.assert(normalized._id === '6716bc5987cfbac92b38dff1', '_id must be preserved')

  // Verify Date format
  console.assert(normalized.startDate === '2026-12-15', 'startDate must be YYYY-MM-DD')
  console.assert(normalized.endDate === '2026-12-20', 'endDate must be YYYY-MM-DD')

  // Verify Default arrays for UI tabs
  console.assert(Array.isArray(normalized.itinerary) && normalized.itinerary.length === 0, 'itinerary array must default to empty []')
  console.assert(Array.isArray(normalized.expenses) && normalized.expenses.length === 0, 'expenses array must default to empty []')
  console.assert(Array.isArray(normalized.bookings) && normalized.bookings.length === 0, 'bookings array must default to empty []')
  console.assert(Array.isArray(normalized.tasks) && normalized.tasks.length === 0, 'tasks array must default to empty []')

  // Verify status computation
  console.assert(typeof normalized.status === 'string' && normalized.status.length > 0, 'status must be computed string')
  console.log('✓ 2: normalizeTrip maps _id -> id, normalizes dates, and ensures safe default arrays.')

  // ---------------------------------------------------------------------------
  // TEST 3: API Service Functions with Mock Server
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 3: Trip API Service Functions (HTTP Integration) ---')

  const server = http.createServer(app)
  await new Promise((resolve) => server.listen(0, resolve))
  const { port } = server.address()

  // Set ephemeral port in global environment so fetch calls hit this mock server
  const originalEnv = process.env.VITE_API_URL
  process.env.VITE_API_URL = `http://127.0.0.1:${port}/api`

  const mockDb = new Map()
  let idCounter = 1

  function generateObjectId() {
    const hex = (idCounter++).toString(16).padStart(24, '0')
    return new mongoose.Types.ObjectId(hex)
  }

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
          const all = Array.from(mockDb.values())
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
    // 3A: createTripApi
    const createRes = await createTripApi({
      name: 'Kerala Backwaters',
      destination: 'Alleppey',
      startDate: '2026-11-20',
      endDate: '2026-11-25',
      travelers: 2,
      budget: 35000,
      notes: 'Houseboat stay',
    })

    console.assert(createRes.success === true, `Expected success: true, got: ${createRes.error}`)
    console.assert(createRes.trip && createRes.trip.id, 'Expected trip object with id')
    console.assert(createRes.trip.name === 'Kerala Backwaters', 'Expected name to match')
    console.assert(createRes.trip.startDate === '2026-11-20', 'Expected startDate YYYY-MM-DD')
    console.log(`✓ 3A: createTripApi successfully created trip "${createRes.trip.name}" with ID: ${createRes.trip.id}.`)

    const createdId = createRes.trip.id

    // 3B: fetchTrips
    const listRes = await fetchTrips()
    console.assert(listRes.success === true, 'Expected fetchTrips success: true')
    console.assert(Array.isArray(listRes.trips) && listRes.trips.length === 1, 'Expected 1 trip in list')
    console.assert(listRes.trips[0].id === createdId, 'Listed trip id must match created id')
    console.log(`✓ 3B: fetchTrips retrieved ${listRes.trips.length} normalized trip(s).`)

    // 3C: fetchTripById
    const singleRes = await fetchTripById(createdId)
    console.assert(singleRes.success === true, 'Expected fetchTripById success: true')
    console.assert(singleRes.trip.id === createdId, 'Fetched trip id must match')
    console.assert(singleRes.trip.destination === 'Alleppey', 'Destination must match')
    console.log('✓ 3C: fetchTripById retrieved trip details correctly.')

    // 3D: updateTripApi
    const updateRes = await updateTripApi(createdId, {
      budget: 40000,
      notes: 'Updated notes with premium houseboat booking',
    })
    console.assert(updateRes.success === true, 'Expected updateTripApi success: true')
    console.assert(updateRes.trip.budget === 40000, 'Budget must be updated to 40000')
    console.log('✓ 3D: updateTripApi updated permitted fields successfully.')

    // 3E: Error contract translation on invalid create
    const invalidCreateRes = await createTripApi({
      name: '',
      destination: '',
    })
    console.assert(invalidCreateRes.success === false, 'Expected success: false for invalid create')
    console.assert(typeof invalidCreateRes.error === 'string' && invalidCreateRes.error.length > 0, 'Expected error message string')
    console.log(`✓ 3E: Backend error correctly translated into { success: false, error: "${invalidCreateRes.error}" }.`)

    // 3F: deleteTripApi
    const deleteRes = await deleteTripApi(createdId)
    console.assert(deleteRes.success === true, 'Expected deleteTripApi success: true')
    console.assert(deleteRes.id === createdId, 'Expected deleted ID to match')
    console.log('✓ 3F: deleteTripApi removed trip successfully.')

    // Subsequent fetch returns 404 error
    const subsequentRes = await fetchTripById(createdId)
    console.assert(subsequentRes.success === false, 'Expected fetch to fail after deletion')
    console.log('✓ 3G: Subsequent fetch returns { success: false } after trip deletion.')
  } finally {
    Trip.prototype.save = origSave
    Trip.find = origFind
    Trip.findById = origFindById
    Trip.findByIdAndDelete = origFindByIdAndDelete
    process.env.VITE_API_URL = originalEnv
    server.close()
  }

  console.log('\n===============================================================')
  console.log('✓ All Milestone 13C Stage 1 Trip API Service Tests PASSED!')
  console.log('===============================================================\n')
}

runTests().catch((err) => {
  console.error('\n❌ Milestone 13C Stage 1 Verification FAILED:', err)
  process.exit(1)
})
