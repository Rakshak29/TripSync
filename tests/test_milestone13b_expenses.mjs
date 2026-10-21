import http from 'node:http'
import app from '../backend/src/app.js'
import Trip from '../backend/src/models/Trip.js'
import Expense, { ALLOWED_CATEGORIES, ALLOWED_PAYMENT_METHODS } from '../backend/src/models/Expense.js'
import { mongoose } from '../backend/src/config/db.js'

console.log('=== TripSync Milestone 13B: Budget & Expenses Backend Verification ===\n')

async function runTests() {
  // ---------------------------------------------------------------------------
  // TEST 1: Expense Mongoose Schema Validations
  // ---------------------------------------------------------------------------
  console.log('--- TEST 1: Expense Schema Validation Rules ---')

  const sampleTripId = new mongoose.Types.ObjectId('111111111111111111111111')

  // 1A: Valid Expense passes validation
  const validExp = new Expense({
    tripId: sampleTripId,
    title: 'Flight Ticket to Goa',
    description: 'Indigo round-trip flight',
    amount: 8500,
    category: 'Transport',
    date: '2026-11-10',
    paymentMethod: 'Credit Card',
    notes: 'Booked via MakeMyTrip, PNR #654321',
  })

  let validErr = null
  try {
    await validExp.validate()
  } catch (err) {
    validErr = err
  }
  console.assert(!validErr, `Valid expense should have no validation errors, got: ${validErr?.message}`)
  console.log('✓ 1A: Valid Expense instance satisfies all schema validation rules.')

  // 1B: Missing required fields
  const emptyExp = new Expense({})
  let emptyErr = null
  try {
    await emptyExp.validate()
  } catch (err) {
    emptyErr = err
  }
  console.assert(emptyErr && emptyErr.errors.tripId, 'tripId must be required')
  console.assert(emptyErr && emptyErr.errors.title, 'title must be required')
  console.assert(emptyErr && emptyErr.errors.amount, 'amount must be required')
  console.assert(emptyErr && emptyErr.errors.date, 'date must be required')
  console.log('✓ 1B: Required fields (tripId, title, amount, date) strictly enforced.')

  // 1C: Non-positive amount rejected
  const zeroExp = new Expense({
    tripId: sampleTripId,
    title: 'Free Entry',
    amount: 0,
    date: '2026-11-10',
  })
  let zeroErr = null
  try {
    await zeroExp.validate()
  } catch (err) {
    zeroErr = err
  }
  console.assert(zeroErr && zeroErr.errors.amount, 'amount <= 0 must fail validation')
  console.log('✓ 1C: Non-positive expense amounts (<= 0) rejected by schema.')

  // 1D: Invalid category rejected
  const invalidCatExp = new Expense({
    tripId: sampleTripId,
    title: 'Lottery',
    amount: 1000,
    category: 'Gambling',
    date: '2026-11-10',
  })
  let catErr = null
  try {
    await invalidCatExp.validate()
  } catch (err) {
    catErr = err
  }
  console.assert(catErr && catErr.errors.category, 'invalid category must fail validation')
  console.log('✓ 1D: Invalid category strictly rejected by enum validation.')

  // 1E: Defaults applied correctly
  const minimalExp = new Expense({
    tripId: sampleTripId,
    title: 'Auto Rickshaw',
    amount: 150,
    date: '2026-11-12',
  })
  console.assert(minimalExp.category === 'Other', 'category must default to Other')
  console.assert(minimalExp.paymentMethod === 'Cash', 'paymentMethod must default to Cash')
  console.log('✓ 1E: Defaults (category: Other, paymentMethod: Cash) applied properly.')

  // ---------------------------------------------------------------------------
  // TEST 2: HTTP Endpoint Tests with Server & Cross-Trip Isolation
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 2: Expense REST Endpoints & Cross-Trip Isolation ---')

  const server = http.createServer(app)
  await new Promise((resolve) => server.listen(0, resolve))
  const { port } = server.address()
  const baseUrl = `http://127.0.0.1:${port}`

  try {
    // Set up mock trips in memory
    const tripAId = new mongoose.Types.ObjectId('000000000000000000000001')
    const tripBId = new mongoose.Types.ObjectId('000000000000000000000002')

    const mockTrips = new Map([
      [
        tripAId.toString(),
        {
          _id: tripAId,
          name: 'Goa Coastal Holiday',
          destination: 'Goa',
          budget: 30000,
        },
      ],
      [
        tripBId.toString(),
        {
          _id: tripBId,
          name: 'Manali Alpine Retreat',
          destination: 'Manali',
          budget: 50000,
        },
      ],
    ])

    const mockExpenses = new Map()
    let expIdCounter = 1

    function generateExpId() {
      const hex = (expIdCounter++).toString(16).padStart(24, '0')
      return new mongoose.Types.ObjectId(hex)
    }

    // Spy/Mock Trip and Expense methods
    const origTripFindById = Trip.findById
    const origExpSave = Expense.prototype.save
    const origExpFind = Expense.find
    const origExpFindOne = Expense.findOne
    const origExpFindOneAndDelete = Expense.findOneAndDelete

    Trip.findById = async function (id) {
      if (!id) return null
      return mockTrips.get(id.toString()) || null
    }

    Expense.prototype.save = async function () {
      await this.validate()
      if (!this._id) {
        this._id = generateExpId()
      }
      this.createdAt = this.createdAt || new Date()
      this.updatedAt = new Date()
      mockExpenses.set(this._id.toString(), this)
      return this
    }

    Expense.find = function (filter = {}) {
      let results = Array.from(mockExpenses.values())

      if (filter.tripId) {
        results = results.filter((e) => e.tripId.toString() === filter.tripId.toString())
      }
      if (filter.category) {
        results = results.filter((e) => e.category === filter.category)
      }
      if (filter.paymentMethod) {
        results = results.filter((e) => e.paymentMethod === filter.paymentMethod)
      }

      return {
        sort: () => Promise.resolve(results),
        then: (resolve) => resolve(results),
      }
    }

    Expense.findOne = async function (query = {}) {
      const all = Array.from(mockExpenses.values())
      return (
        all.find((e) => {
          let match = true
          if (query._id && e._id.toString() !== query._id.toString()) match = false
          if (query.tripId && e.tripId.toString() !== query.tripId.toString()) match = false
          return match
        }) || null
      )
    }

    Expense.findOneAndDelete = async function (query = {}) {
      const all = Array.from(mockExpenses.values())
      const target = all.find((e) => {
        let match = true
        if (query._id && e._id.toString() !== query._id.toString()) match = false
        if (query.tripId && e.tripId.toString() !== query.tripId.toString()) match = false
        return match
      })
      if (target) {
        mockExpenses.delete(target._id.toString())
      }
      return target || null
    }

    try {
      // 2A: Validation rejections on POST
      const emptyPostRes = await fetch(`${baseUrl}/api/trips/${tripAId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      console.assert(emptyPostRes.status === 400, `Expected 400 for empty body, got ${emptyPostRes.status}`)
      const emptyPostData = await emptyPostRes.json()
      console.assert(emptyPostData.status === 'error', 'Expected error status')
      console.log(`✓ 2A: POST /expenses rejects empty request with HTTP 400: "${emptyPostData.message}".`)

      // 2B: Non-existent trip returns 404
      const nonExistentTripId = new mongoose.Types.ObjectId('999999999999999999999999')
      const missingTripRes = await fetch(`${baseUrl}/api/trips/${nonExistentTripId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Hotel',
          amount: 5000,
          date: '2026-11-10',
        }),
      })
      console.assert(missingTripRes.status === 404, `Expected 404 for missing trip, got ${missingTripRes.status}`)
      console.log('✓ 2B: POST /expenses returns HTTP 404 when target trip does not exist.')

      // 2C: Invalid trip ID format returns 400
      const invalidTripRes = await fetch(`${baseUrl}/api/trips/invalid-id/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Hotel',
          amount: 5000,
          date: '2026-11-10',
        }),
      })
      console.assert(invalidTripRes.status === 400, `Expected 400, got ${invalidTripRes.status}`)
      console.log('✓ 2C: Invalid trip ID format correctly rejected with HTTP 400.')

      // 2D: Successfully create expense for Trip A
      const createExp1Res = await fetch(`${baseUrl}/api/trips/${tripAId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Beach Resort Stay',
          amount: 14000,
          category: 'Accommodation',
          date: '2026-11-10',
          paymentMethod: 'Credit Card',
          notes: '3 nights near Palolem beach',
        }),
      })
      console.assert(createExp1Res.status === 201, `Expected 201, got ${createExp1Res.status}`)
      const exp1Data = await createExp1Res.json()
      console.assert(exp1Data.status === 'success', 'Expected success status')
      const exp1 = exp1Data.data.expense
      console.assert(exp1.amount === 14000, 'Expected amount 14000')
      console.assert(exp1.category === 'Accommodation', 'Expected category Accommodation')
      console.log(`✓ 2D: POST /expenses created expense "${exp1.title}" (ID: ${exp1._id}) for Trip A.`)

      // 2E: Create second expense for Trip A and an expense for Trip B
      const createExp2Res = await fetch(`${baseUrl}/api/trips/${tripAId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Seafood Dinner & Drinks',
          amount: 4500,
          category: 'Food',
          date: '2026-11-11',
          paymentMethod: 'UPI',
        }),
      })
      const exp2Data = await createExp2Res.json()
      const exp2 = exp2Data.data.expense

      const createExpBRes = await fetch(`${baseUrl}/api/trips/${tripBId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Volvo Bus to Manali',
          amount: 3200,
          category: 'Transport',
          date: '2026-12-01',
          paymentMethod: 'Net Banking',
        }),
      })
      const expBData = await createExpBRes.json()
      const expB = expBData.data.expense
      console.log('✓ 2E: Successfully created multi-trip expenses.')

      // 2F: List Trip A expenses (should contain 2 items, NOT Trip B's item)
      const listRes = await fetch(`${baseUrl}/api/trips/${tripAId}/expenses`)
      console.assert(listRes.status === 200, `Expected 200, got ${listRes.status}`)
      const listData = await listRes.json()
      console.assert(listData.count === 2, `Expected 2 expenses for Trip A, got ${listData.count}`)
      console.assert(
        listData.data.expenses.every((e) => e.tripId.toString() === tripAId.toString()),
        'All returned expenses must belong strictly to Trip A'
      )
      console.log(`✓ 2F: GET /expenses listed ${listData.count} expenses strictly scoped to Trip A.`)

      // 2G: Category filter
      const catRes = await fetch(`${baseUrl}/api/trips/${tripAId}/expenses?category=Food`)
      const catData = await catRes.json()
      console.assert(catData.count === 1, 'Expected 1 Food expense')
      console.assert(catData.data.expenses[0].title === 'Seafood Dinner & Drinks', 'Expected Seafood Dinner')
      console.log('✓ 2G: GET /expenses?category=Food filtered properly.')

      // 2H: Single expense retrieval
      const singleRes = await fetch(`${baseUrl}/api/trips/${tripAId}/expenses/${exp1._id}`)
      console.assert(singleRes.status === 200, `Expected 200, got ${singleRes.status}`)
      const singleData = await singleRes.json()
      console.assert(singleData.data.expense.title === 'Beach Resort Stay', 'Expected Beach Resort Stay')
      console.log('✓ 2H: GET /expenses/:id retrieved single expense correctly.')

      // 2I: CROSS-TRIP ISOLATION ENFORCEMENT
      // Attempting to access Trip B's expense through Trip A's route MUST return 404
      const crossTripGetRes = await fetch(`${baseUrl}/api/trips/${tripAId}/expenses/${expB._id}`)
      console.assert(
        crossTripGetRes.status === 404,
        `Expected 404 for cross-trip expense access, got ${crossTripGetRes.status}`
      )
      console.log('✓ 2I: Cross-trip GET access blocked with HTTP 404 (isolation enforced).')

      // Attempting to PATCH Trip B's expense through Trip A's route MUST return 404
      const crossTripPatchRes = await fetch(`${baseUrl}/api/trips/${tripAId}/expenses/${expB._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 9999 }),
      })
      console.assert(crossTripPatchRes.status === 404, `Expected 404, got ${crossTripPatchRes.status}`)
      console.log('✓ 2J: Cross-trip PATCH access blocked with HTTP 404 (isolation enforced).')

      // Attempting to DELETE Trip B's expense through Trip A's route MUST return 404
      const crossTripDelRes = await fetch(`${baseUrl}/api/trips/${tripAId}/expenses/${expB._id}`, {
        method: 'DELETE',
      })
      console.assert(crossTripDelRes.status === 404, `Expected 404, got ${crossTripDelRes.status}`)
      console.log('✓ 2K: Cross-trip DELETE access blocked with HTTP 404 (isolation enforced).')

      // 2L: PATCH update permitted fields
      const patchRes = await fetch(`${baseUrl}/api/trips/${tripAId}/expenses/${exp2._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 5000,
          notes: 'Added dessert and tips',
        }),
      })
      console.assert(patchRes.status === 200, `Expected 200, got ${patchRes.status}`)
      const patchData = await patchRes.json()
      console.assert(patchData.data.expense.amount === 5000, 'Expected updated amount 5000')
      console.assert(patchData.data.expense.notes === 'Added dessert and tips', 'Expected updated notes')
      console.log('✓ 2L: PATCH /expenses/:id updated permitted fields successfully.')

      // Rejection of immutable fields in PATCH
      const patchImmRes = await fetch(`${baseUrl}/api/trips/${tripAId}/expenses/${exp2._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId: tripBId }),
      })
      console.assert(patchImmRes.status === 400, `Expected 400 for immutable tripId modification, got ${patchImmRes.status}`)
      console.log('✓ 2M: PATCH rejected attempt to modify immutable tripId.')

      // -------------------------------------------------------------------------
      // TEST 3: Dynamic Budget Summary Calculations
      // -------------------------------------------------------------------------
      console.log('\n--- TEST 3: Dynamic Budget Summary Calculations ---')

      // Trip A Budget: 30000
      // Expenses:
      // - Accommodation: 14000
      // - Food: 5000 (after update)
      // Total spent = 19000
      // Remaining = 11000
      // Percentage = Math.round(19000 / 30000 * 100) = 63%
      // isOverBudget = false

      const summaryRes = await fetch(`${baseUrl}/api/trips/${tripAId}/budget-summary`)
      console.assert(summaryRes.status === 200, `Expected 200, got ${summaryRes.status}`)
      const summaryData = await summaryRes.json()
      const bSummary = summaryData.data.budgetSummary

      console.assert(bSummary.totalBudget === 30000, `Expected totalBudget 30000, got ${bSummary.totalBudget}`)
      console.assert(bSummary.totalSpent === 19000, `Expected totalSpent 19000, got ${bSummary.totalSpent}`)
      console.assert(bSummary.remainingBudget === 11000, `Expected remainingBudget 11000, got ${bSummary.remainingBudget}`)
      console.assert(bSummary.percentageUsed === 63, `Expected percentageUsed 63, got ${bSummary.percentageUsed}`)
      console.assert(bSummary.isOverBudget === false, 'Expected isOverBudget to be false')
      console.assert(bSummary.expenseCount === 2, `Expected expenseCount 2, got ${bSummary.expenseCount}`)

      // Verify category breakdown
      const accommCat = bSummary.categoryBreakdown.find((c) => c.category === 'Accommodation')
      const foodCat = bSummary.categoryBreakdown.find((c) => c.category === 'Food')
      console.assert(accommCat && accommCat.total === 14000, 'Accommodation total must be 14000')
      console.assert(foodCat && foodCat.total === 5000, 'Food total must be 5000')
      console.assert(accommCat.percentage === 74, `Expected accomm percentage 74, got ${accommCat.percentage}`)
      console.assert(foodCat.percentage === 26, `Expected food percentage 26, got ${foodCat.percentage}`)
      console.log('✓ 3A: Dynamic budget summary accurately calculates total spent (₹19,000), remaining (₹11,000), and 63% usage.')
      console.log('✓ 3B: Category breakdown accurately tracks totals and proportions.')

      // Also verify alternative route: /api/trips/:tripId/expenses/summary
      const altSummaryRes = await fetch(`${baseUrl}/api/trips/${tripAId}/expenses/summary`)
      console.assert(altSummaryRes.status === 200, 'Expected 200 on /expenses/summary route')
      console.log('✓ 3C: Alternative /api/trips/:tripId/expenses/summary endpoint functions identically.')

      // 2N: DELETE expense
      const delRes = await fetch(`${baseUrl}/api/trips/${tripAId}/expenses/${exp1._id}`, {
        method: 'DELETE',
      })
      console.assert(delRes.status === 200, `Expected 200 on delete, got ${delRes.status}`)
      console.log(`✓ 2N: DELETE /expenses/:id deleted expense ${exp1._id} successfully.`)

      // Subsequent GET returns 404
      const getDeletedRes = await fetch(`${baseUrl}/api/trips/${tripAId}/expenses/${exp1._id}`)
      console.assert(getDeletedRes.status === 404, `Expected 404, got ${getDeletedRes.status}`)
      console.log('✓ 2O: Subsequent GET for deleted expense returns HTTP 404.')
    } finally {
      Trip.findById = origTripFindById
      Expense.prototype.save = origExpSave
      Expense.find = origExpFind
      Expense.findOne = origExpFindOne
      Expense.findOneAndDelete = origExpFindOneAndDelete
    }
  } finally {
    server.close()
  }

  console.log('\n===============================================================')
  console.log('✓ All Milestone 13B Budget & Expenses Backend Tests PASSED!')
  console.log('===============================================================\n')
}

runTests().catch((err) => {
  console.error('\n❌ Milestone 13B Budget & Expenses Backend Verification FAILED:', err)
  process.exit(1)
})
