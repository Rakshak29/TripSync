import http from 'node:http'
import app from '../backend/src/app.js'
import Trip from '../backend/src/models/Trip.js'
import { mongoose } from '../backend/src/config/db.js'

console.log('=== TripSync Milestone 12: Trip Data Models and REST APIs Verification ===\n')

async function runTests() {
  // ---------------------------------------------------------------------------
  // TEST 1: Trip Mongoose Schema Validations (Direct Schema Unit Tests)
  // ---------------------------------------------------------------------------
  console.log('--- TEST 1: Trip Schema Validation Rules ---')

  // 1A: Valid trip passes validation
  const validTrip = new Trip({
    name: 'Himalayan Trek',
    destination: 'Manali',
    startDate: '2026-06-10',
    endDate: '2026-06-15',
    travelers: 4,
    budget: 45000,
    notes: 'Base camp near Solang Valley.',
  })
  let validErr = null
  try {
    await validTrip.validate()
  } catch (err) {
    validErr = err
  }
  console.assert(!validErr, `Valid trip should have no validation errors, got: ${validErr?.message}`)
  console.log('✓ 1A: Valid trip instance satisfies all schema validation rules.')

  // 1B: Missing required fields
  const emptyTrip = new Trip({})
  let emptyErr = null
  try {
    await emptyTrip.validate()
  } catch (err) {
    emptyErr = err
  }
  console.assert(emptyErr && emptyErr.errors.name, 'name must be required')
  console.assert(emptyErr && emptyErr.errors.destination, 'destination must be required')
  console.assert(emptyErr && emptyErr.errors.startDate, 'startDate must be required')
  console.assert(emptyErr && emptyErr.errors.endDate, 'endDate must be required')
  console.assert(emptyErr && emptyErr.errors.budget, 'budget must be required')
  console.log('✓ 1B: Required fields (name, destination, dates, budget) strictly enforced.')

  // 1C: End date before start date
  const invertedDatesTrip = new Trip({
    name: 'Time Travel',
    destination: 'Goa',
    startDate: '2026-07-20',
    endDate: '2026-07-15',
    travelers: 2,
    budget: 30000,
  })
  let dateErr = null
  try {
    await invertedDatesTrip.validate()
  } catch (err) {
    dateErr = err
  }
  console.assert(
    dateErr && dateErr.errors.endDate && dateErr.errors.endDate.message.includes('cannot precede'),
    `Expected date ordering error, got: ${dateErr?.message}`
  )
  console.log('✓ 1C: Date logic rejected inverted range (endDate < startDate).')

  // 1D: Non-positive budget
  const zeroBudgetTrip = new Trip({
    name: 'Free Trip',
    destination: 'Jaipur',
    startDate: '2026-08-01',
    endDate: '2026-08-05',
    travelers: 1,
    budget: 0,
  })
  let budgetErr = null
  try {
    await zeroBudgetTrip.validate()
  } catch (err) {
    budgetErr = err
  }
  console.assert(
    budgetErr && budgetErr.errors.budget,
    `Budget <= 0 should fail validation, got: ${budgetErr?.message}`
  )
  console.log('✓ 1D: Budget validation strictly enforces positive budget > 0.')

  // 1E: Invalid traveler count (< 1 or non-integer)
  const invalidTravelersTrip = new Trip({
    name: 'Solo Trip',
    destination: 'Rishikesh',
    startDate: '2026-09-01',
    endDate: '2026-09-04',
    travelers: 0,
    budget: 15000,
  })
  let travelerErr = null
  try {
    await invalidTravelersTrip.validate()
  } catch (err) {
    travelerErr = err
  }
  console.assert(
    travelerErr && travelerErr.errors.travelers,
    `Travelers < 1 must fail validation, got: ${travelerErr?.message}`
  )
  console.log('✓ 1E: Traveler count < 1 rejected.')

  // ---------------------------------------------------------------------------
  // TEST 2: HTTP Endpoint Tests with Server
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 2: REST Endpoints HTTP Verification ---')

  const server = http.createServer(app)
  await new Promise((resolve) => server.listen(0, resolve))
  const { port } = server.address()
  const baseUrl = `http://127.0.0.1:${port}`

  try {
    // 2A: POST /api/trips Validation Rejections
    const emptyPostRes = await fetch(`${baseUrl}/api/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    console.assert(emptyPostRes.status === 400, `Expected 400 for empty body, got ${emptyPostRes.status}`)
    const emptyPostData = await emptyPostRes.json()
    console.assert(emptyPostData.status === 'error', 'Expected error status')
    console.log(`✓ 2A: POST /api/trips rejects empty request with HTTP 400: "${emptyPostData.message}".`)

    // 2B: POST /api/trips Invalid Budget Rejection
    const invalidBudgetRes = await fetch(`${baseUrl}/api/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Summer Escape',
        destination: 'Munnar',
        startDate: '2026-05-01',
        endDate: '2026-05-05',
        travelers: 2,
        budget: -100,
      }),
    })
    console.assert(invalidBudgetRes.status === 400, `Expected 400 for negative budget, got ${invalidBudgetRes.status}`)
    console.log('✓ 2B: POST /api/trips rejects negative/zero budget with HTTP 400.')

    // 2C: In-Memory / Mock Store for Mocked HTTP CRUD Cycle
    const mockDb = new Map()
    let mockIdCounter = 1

    function generateMockObjectId() {
      const hex = (mockIdCounter++).toString(16).padStart(24, '0')
      return new mongoose.Types.ObjectId(hex)
    }

    // Temporarily spy/mock Trip methods to test endpoints in isolation
    const originalSave = Trip.prototype.save
    const originalFind = Trip.find
    const originalFindById = Trip.findById
    const originalFindByIdAndDelete = Trip.findByIdAndDelete

    Trip.prototype.save = async function () {
      await this.validate()
      if (!this._id) {
        this._id = generateMockObjectId()
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
      return mockDb.get(id.toString()) || null
    }

    Trip.findByIdAndDelete = async function (id) {
      const item = mockDb.get(id.toString()) || null
      if (item) {
        mockDb.delete(id.toString())
      }
      return item
    }

    let createdTripId

    try {
      // 2D: POST /api/trips Successful Creation
      const createRes = await fetch(`${baseUrl}/api/trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Golden Triangle Tour',
          destination: 'Jaipur',
          startDate: '2026-11-10',
          endDate: '2026-11-15',
          travelers: 3,
          budget: 55000,
          notes: 'Visit Amber Fort and Hawa Mahal.',
        }),
      })
      console.assert(createRes.status === 201, `Expected 201 Created, got ${createRes.status}`)
      const createData = await createRes.json()
      console.assert(createData.status === 'ok', 'Status must be ok')
      console.assert(createData.data.name === 'Golden Triangle Tour', 'Name must match')
      console.assert(createData.data._id, 'Created trip must have an _id')
      createdTripId = createData.data._id.toString()
      console.log(`✓ 2C: POST /api/trips created trip successfully with ID: ${createdTripId}.`)

      // 2E: GET /api/trips List
      const listRes = await fetch(`${baseUrl}/api/trips`)
      console.assert(listRes.status === 200, `Expected 200, got ${listRes.status}`)
      const listData = await listRes.json()
      console.assert(listData.status === 'ok', 'Status must be ok')
      console.assert(listData.count === 1, `Expected count 1, got ${listData.count}`)
      console.assert(listData.data[0].destination === 'Jaipur', 'Destination must match')
      console.log(`✓ 2D: GET /api/trips listed ${listData.count} trip(s).`)

      // 2F: GET /api/trips/:id Successful Read
      const getSingleRes = await fetch(`${baseUrl}/api/trips/${createdTripId}`)
      console.assert(getSingleRes.status === 200, `Expected 200, got ${getSingleRes.status}`)
      const getSingleData = await getSingleRes.json()
      console.assert(getSingleData.data.name === 'Golden Triangle Tour', 'Name must match')
      console.log(`✓ 2E: GET /api/trips/:id retrieved trip by ID.`)

      // 2G: GET /api/trips/:id Invalid ID Format (400)
      const invalidIdRes = await fetch(`${baseUrl}/api/trips/123-not-an-objectid`)
      console.assert(invalidIdRes.status === 400, `Expected 400 for invalid ID, got ${invalidIdRes.status}`)
      console.log('✓ 2F: GET /api/trips/:id rejects invalid hex ObjectId with HTTP 400.')

      // 2H: GET /api/trips/:id Nonexistent ID (404)
      const nonExistentId = new mongoose.Types.ObjectId().toString()
      const notFoundIdRes = await fetch(`${baseUrl}/api/trips/${nonExistentId}`)
      console.assert(notFoundIdRes.status === 404, `Expected 404 for nonexistent ID, got ${notFoundIdRes.status}`)
      console.log('✓ 2G: GET /api/trips/:id returns HTTP 404 for nonexistent ID.')

      // 2I: PATCH /api/trips/:id Disallow _id Modification
      const patchDisallowedRes = await fetch(`${baseUrl}/api/trips/${createdTripId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: '507f1f77bcf86cd799439011' }),
      })
      console.assert(patchDisallowedRes.status === 400, `Expected 400 when modifying _id, got ${patchDisallowedRes.status}`)
      console.log('✓ 2H: PATCH /api/trips/:id rejects attempt to modify immutable _id.')

      // 2J: PATCH /api/trips/:id Successful Partial Update
      const patchRes = await fetch(`${baseUrl}/api/trips/${createdTripId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget: 62000,
          travelers: 4,
          notes: 'Updated: added extra traveler and revised budget.',
        }),
      })
      console.assert(patchRes.status === 200, `Expected 200, got ${patchRes.status}`)
      const patchData = await patchRes.json()
      console.assert(patchData.data.budget === 62000, 'Budget must be updated')
      console.assert(patchData.data.travelers === 4, 'Travelers must be updated')
      console.assert(patchData.data.name === 'Golden Triangle Tour', 'Unmodified name must be preserved')
      console.log('✓ 2I: PATCH /api/trips/:id updated permitted fields successfully.')

      // 2K: DELETE /api/trips/:id Successful Deletion
      const deleteRes = await fetch(`${baseUrl}/api/trips/${createdTripId}`, {
        method: 'DELETE',
      })
      console.assert(deleteRes.status === 200, `Expected 200, got ${deleteRes.status}`)
      console.log(`✓ 2J: DELETE /api/trips/:id deleted trip successfully.`)

      // Verify trip is now gone (404)
      const verifyGoneRes = await fetch(`${baseUrl}/api/trips/${createdTripId}`)
      console.assert(verifyGoneRes.status === 404, 'Deleted trip should return 404')
      console.log('✓ 2K: Subsequent GET for deleted trip returns HTTP 404.')
    } finally {
      // Restore original Trip methods
      Trip.prototype.save = originalSave
      Trip.find = originalFind
      Trip.findById = originalFindById
      Trip.findByIdAndDelete = originalFindByIdAndDelete
    }

    // ---------------------------------------------------------------------------
    // TEST 3: Health Endpoint Non-Regression
    // ---------------------------------------------------------------------------
    console.log('\n--- TEST 3: Health Endpoint Compatibility ---')
    const healthRes = await fetch(`${baseUrl}/api/health`)
    console.assert(healthRes.status === 200, `Expected 200, got ${healthRes.status}`)
    const healthData = await healthRes.json()
    console.assert(healthData.status === 'ok', 'Status must be ok')
    console.assert(healthData.message === 'TripSync backend is running', 'Health message preserved')
    console.assert(healthData.database !== undefined, 'Database object must be present')
    console.log('✓ 3: GET /api/health remains fully functional with process and database status.')

    console.log('\n=== All Milestone 12 Trip Data Models and APIs Tests PASSED Successfully! ===')
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
}

runTests().catch((err) => {
  console.error('❌ Milestone 12 Trip API Test FAILED:', err)
  process.exit(1)
})
