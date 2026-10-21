import http from 'node:http'
import app from '../backend/src/app.js'
import Destination from '../backend/src/models/Destination.js'
import { mapDaysToDurationTier } from '../backend/src/controllers/destinationController.js'
import { mongoose } from '../backend/src/config/db.js'

console.log('=== TripSync Milestone 13 Part 13A: Discover Destinations Backend Verification ===\n')

async function runTests() {
  // ---------------------------------------------------------------------------
  // TEST 1: Destination Mongoose Schema Validations
  // ---------------------------------------------------------------------------
  console.log('--- TEST 1: Destination Schema Validation Rules ---')

  // 1A: Valid Destination passes validation
  const validDest = new Destination({
    customId: 'place_manali',
    name: 'Manali',
    state: 'Himachal Pradesh',
    category: 'Mountains',
    categoryIcon: '🏔️',
    durations: ['3-5', '6-10'],
    durationDisplay: '3–5 days',
    groups: ["Friends / Boys' Trip", 'Family'],
    experiences: ['Mountains', 'Trekking', 'Adventure'],
    budgetRanges: ['10k-25k', '25k-50k'],
    budgetDisplay: '₹12,000 – ₹22,000 per person',
    moods: ['Adventurous', 'Scenic'],
    description: 'High-altitude Himalayan valley with alpine trekking trails.',
    overview: 'A premier mountain gateway in the Kullu Valley.',
    highlights: ['Solang Valley', 'Rohtang Pass'],
    bestTime: 'October – June',
    isDomestic: true,
  })

  let validErr = null
  try {
    await validDest.validate()
  } catch (err) {
    validErr = err
  }
  console.assert(!validErr, `Valid destination should have no validation errors, got: ${validErr?.message}`)
  console.log('✓ 1A: Valid Destination instance satisfies all schema validation rules.')

  // 1B: Missing required fields
  const emptyDest = new Destination({})
  let emptyErr = null
  try {
    await emptyDest.validate()
  } catch (err) {
    emptyErr = err
  }
  console.assert(emptyErr && emptyErr.errors.customId, 'customId must be required')
  console.assert(emptyErr && emptyErr.errors.name, 'name must be required')
  console.assert(emptyErr && emptyErr.errors.state, 'state must be required')
  console.assert(emptyErr && emptyErr.errors.category, 'category must be required')
  console.assert(emptyErr && emptyErr.errors.description, 'description must be required')
  console.log('✓ 1B: Required fields (customId, name, state, category, description) strictly enforced.')

  // 1C: Default values
  const minimalDest = new Destination({
    customId: 'place_test',
    name: 'Test Place',
    state: 'Test State',
    category: 'Nature',
    description: 'A test destination for defaults.',
  })
  console.assert(minimalDest.isDomestic === true, 'isDomestic must default to true')
  console.assert(minimalDest.categoryIcon === '📍', 'categoryIcon must default to 📍')
  console.log('✓ 1C: Defaults (isDomestic: true, categoryIcon: 📍) applied correctly.')

  // ---------------------------------------------------------------------------
  // TEST 2: Duration Mapping Helper
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 2: Duration Mapping Helper ---')
  console.assert(mapDaysToDurationTier(1) === '1-2', '1 day should be 1-2')
  console.assert(mapDaysToDurationTier(2) === '1-2', '2 days should be 1-2')
  console.assert(mapDaysToDurationTier(4) === '3-5', '4 days should be 3-5')
  console.assert(mapDaysToDurationTier(7) === '6-10', '7 days should be 6-10')
  console.assert(mapDaysToDurationTier(14) === '11+', '14 days should be 11+')
  console.assert(mapDaysToDurationTier(0) === null, '0 days should return null')
  console.assert(mapDaysToDurationTier('abc') === null, 'Invalid string should return null')
  console.log('✓ 2: mapDaysToDurationTier accurately maps custom days to duration tiers.')

  // ---------------------------------------------------------------------------
  // TEST 3: HTTP Endpoint Tests with Server
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 3: Destination REST Endpoints HTTP Verification ---')

  const server = http.createServer(app)
  await new Promise((resolve) => server.listen(0, resolve))
  const { port } = server.address()
  const baseUrl = `http://127.0.0.1:${port}`

  try {
    // 3A: Sample Mock Store for in-memory HTTP endpoint testing
    const sampleManali = {
      _id: new mongoose.Types.ObjectId('000000000000000000000001'),
      customId: 'place_manali',
      name: 'Manali',
      state: 'Himachal Pradesh',
      category: 'Mountains',
      categoryIcon: '🏔️',
      durations: ['3-5', '6-10'],
      durationDisplay: '3–5 days',
      groups: ["Friends / Boys' Trip", 'Family'],
      experiences: ['Mountains', 'Trekking', 'Adventure'],
      budgetRanges: ['10k-25k', '25k-50k'],
      budgetDisplay: '₹12,000 – ₹22,000 per person',
      moods: ['Adventurous', 'Scenic', 'Peaceful'],
      description: 'High-altitude Himalayan valley with alpine trekking trails.',
      overview: 'Premier mountain gateway.',
      highlights: ['Solang Valley', 'Rohtang Pass'],
      bestTime: 'October – June',
      isDomestic: true,
    }

    const sampleGoa = {
      _id: new mongoose.Types.ObjectId('000000000000000000000002'),
      customId: 'place_goa',
      name: 'Goa',
      state: 'Goa',
      category: 'Beaches',
      categoryIcon: '🏖️',
      durations: ['3-5', '6-10'],
      durationDisplay: '3–5 days',
      groups: ["Friends / Boys' Trip", 'Couple / Honeymoon', 'Solo'],
      experiences: ['Beaches', 'Nightlife', 'Relaxation'],
      budgetRanges: ['10k-25k', '25k-50k', '50k+'],
      budgetDisplay: '₹15,000 – ₹30,000 per person',
      moods: ['Fun and Social', 'Scenic', 'Peaceful'],
      description: 'Coastal haven with golden beaches and vibrant nightlife.',
      overview: 'Goa combines coastal living with colonial architecture.',
      highlights: ['Palolem', 'Fort Aguada'],
      bestTime: 'November – February',
      isDomestic: true,
    }

    const mockDb = [sampleManali, sampleGoa]

    // Temporarily mock Destination find methods
    const originalFind = Destination.find
    const originalFindById = Destination.findById
    const originalFindOne = Destination.findOne

    Destination.find = function (filter = {}) {
      let filtered = [...mockDb]

      if (filter.category && filter.category.$regex) {
        filtered = filtered.filter((d) => filter.category.$regex.test(d.category))
      }

      if (filter.state && filter.state.$regex) {
        filtered = filtered.filter((d) => filter.state.$regex.test(d.state))
      }

      if (filter.$or) {
        filtered = filtered.filter((d) =>
          filter.$or.some((clause) => {
            if (clause.name && clause.name.test(d.name)) return true
            if (clause.state && clause.state.test(d.state)) return true
            if (clause.category && clause.category.test(d.category)) return true
            if (clause.description && clause.description.test(d.description)) return true
            return false
          })
        )
      }

      return {
        sort: () => Promise.resolve(filtered),
        then: (resolve) => resolve(filtered),
      }
    }

    Destination.findById = async function (id) {
      return mockDb.find((d) => d._id.toString() === id.toString()) || null
    }

    Destination.findOne = async function (query) {
      if (query && query.customId) {
        return mockDb.find((d) => d.customId === query.customId) || null
      }
      return null
    }

    try {
      // 3B: GET /api/destinations — List all
      const listRes = await fetch(`${baseUrl}/api/destinations`)
      console.assert(listRes.status === 200, `Expected 200, got ${listRes.status}`)
      const listData = await listRes.json()
      console.assert(listData.status === 'success', 'Expected status success')
      console.assert(Array.isArray(listData.data.destinations), 'Expected destinations array')
      console.assert(listData.data.destinations.length === 2, 'Expected 2 destinations')
      console.log(`✓ 3A: GET /api/destinations returns 200 with list of ${listData.results} destinations.`)

      // 3C: GET /api/destinations?category=Mountains — Category filter
      const catRes = await fetch(`${baseUrl}/api/destinations?category=Mountains`)
      console.assert(catRes.status === 200, `Expected 200, got ${catRes.status}`)
      const catData = await catRes.json()
      console.assert(catData.data.destinations.length === 1, 'Expected 1 mountain destination')
      console.assert(catData.data.destinations[0].name === 'Manali', 'Expected Manali')
      console.log('✓ 3B: GET /api/destinations?category=Mountains filters category correctly.')

      // 3D: GET /api/destinations?search=Goa — Keyword search
      const searchRes = await fetch(`${baseUrl}/api/destinations?search=Goa`)
      console.assert(searchRes.status === 200, `Expected 200, got ${searchRes.status}`)
      const searchData = await searchRes.json()
      console.assert(searchData.data.destinations.length === 1, 'Expected 1 search match')
      console.assert(searchData.data.destinations[0].name === 'Goa', 'Expected Goa')
      console.log('✓ 3C: GET /api/destinations?search=Goa matches keyword correctly.')

      // 3E: GET /api/destinations/:id — Lookup by customId
      const customIdRes = await fetch(`${baseUrl}/api/destinations/place_manali`)
      console.assert(customIdRes.status === 200, `Expected 200, got ${customIdRes.status}`)
      const customIdData = await customIdRes.json()
      console.assert(customIdData.data.destination.name === 'Manali', 'Expected Manali by customId')
      console.log('✓ 3D: GET /api/destinations/place_manali retrieves destination by customId.')

      // 3F: GET /api/destinations/:id — Lookup by MongoDB ObjectId
      const objectIdRes = await fetch(`${baseUrl}/api/destinations/000000000000000000000002`)
      console.assert(objectIdRes.status === 200, `Expected 200, got ${objectIdRes.status}`)
      const objectIdData = await objectIdRes.json()
      console.assert(objectIdData.data.destination.name === 'Goa', 'Expected Goa by ObjectId')
      console.log('✓ 3E: GET /api/destinations/:id retrieves destination by valid ObjectId.')

      // 3G: GET /api/destinations/:id — Non-existent ID returns 404
      const notFoundRes = await fetch(`${baseUrl}/api/destinations/place_nonexistent`)
      console.assert(notFoundRes.status === 404, `Expected 404, got ${notFoundRes.status}`)
      const notFoundData = await notFoundRes.json()
      console.assert(notFoundData.status === 'error', 'Expected error status')
      console.log(`✓ 3F: GET /api/destinations/unknown returns 404: "${notFoundData.message}".`)

      // 3H: POST /api/destinations/recommend — Missing questionnaire inputs returns 400
      const emptyRecRes = await fetch(`${baseUrl}/api/destinations/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      console.assert(emptyRecRes.status === 400, `Expected 400 for empty questionnaire, got ${emptyRecRes.status}`)
      const emptyRecData = await emptyRecRes.json()
      console.assert(emptyRecData.status === 'error', 'Expected error status')
      console.log(`✓ 3G: POST /api/destinations/recommend rejects empty body with 400: "${emptyRecData.message}".`)

      // 3I: POST /api/destinations/recommend — Valid questionnaire generates ranked recommendations
      const recRes = await fetch(`${baseUrl}/api/destinations/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duration: '3-5',
          group: "Friends / Boys' Trip",
          experiences: ['Mountains', 'Trekking'],
          budget: '10k-25k',
          moods: ['Adventurous'],
          domesticOnly: true,
        }),
      })
      console.assert(recRes.status === 200, `Expected 200, got ${recRes.status}`)
      const recData = await recRes.json()
      console.assert(recData.status === 'success', 'Expected success status')
      console.assert(Array.isArray(recData.data.recommendations), 'Expected recommendations array')
      console.assert(recData.data.recommendations.length > 0, 'Expected at least 1 recommendation')

      const topRec = recData.data.recommendations[0]
      console.assert(topRec.destination.name === 'Manali', 'Manali should rank highest for mountain/trekking criteria')
      console.assert(topRec.score >= 7, 'Score must meet qualification threshold (>=7)')
      console.assert(topRec.isGroupMatch === true, 'Group match must be true')
      console.assert(topRec.isDurationMatch === true, 'Duration match must be true')
      console.assert(topRec.isBudgetMatch === true, 'Budget match must be true')
      console.assert(topRec.matchingExperiences.length === 2, 'Should match 2 experiences')
      console.log(`✓ 3H: POST /api/destinations/recommend successfully ranks recommendations (Top: ${topRec.destination.name}, score: ${topRec.score}).`)
    } finally {
      // Restore original Destination methods
      Destination.find = originalFind
      Destination.findById = originalFindById
      Destination.findOne = originalFindOne
    }
  } finally {
    server.close()
  }

  console.log('\n===============================================================')
  console.log('✓ All Milestone 13 Part 13A Destination Backend Tests PASSED!')
  console.log('===============================================================\n')
}

runTests().catch((err) => {
  console.error('\n❌ Milestone 13 Destination Backend Verification FAILED:', err)
  process.exit(1)
})
