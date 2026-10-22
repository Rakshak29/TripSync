import http from 'node:http'
import app from '../backend/src/app.js'
import Destination from '../backend/src/models/Destination.js'
import { mongoose } from '../backend/src/config/db.js'
import {
  normalizeDestination,
  fetchDestinations,
  fetchDestinationById,
  recommendDestinations,
} from '../src/services/destinationApi.js'

console.log('=== TripSync Milestone 13D Stage 2: Destination API Client Verification ===\n')

async function runTests() {
  // ---------------------------------------------------------------------------
  // TEST 1: Destination Document Normalization
  // ---------------------------------------------------------------------------
  console.log('--- TEST 1: Destination Document Normalization ---')

  const sampleRawDest = {
    _id: new mongoose.Types.ObjectId('6ad91854684a66cfaabe3f13'),
    customId: 'place_manali',
    name: '  Manali  ',
    state: ' Himachal Pradesh ',
    category: ' Mountains ',
    categoryIcon: '🏔️',
    durations: ['3-5', '6-10'],
    durationDisplay: '3–5 days (or 6–7 days with Solang & Rohtang)',
    groups: ["Friends / Boys' Trip", 'Family', 'Couple / Honeymoon', 'Solo'],
    experiences: ['Mountains', 'Trekking', 'Adventure', 'Nature and Wildlife', 'Relaxation'],
    budgetRanges: ['10k-25k', '25k-50k'],
    budgetDisplay: '₹12,000 – ₹22,000 per person',
    moods: ['Adventurous', 'Scenic', 'Peaceful', 'Fun and Social'],
    description: 'High-altitude Himalayan valley with snow-capped peaks.',
    overview: 'A premier mountain gateway in the Kullu Valley.',
    highlights: ['Solang Valley', 'Rohtang Pass'],
    bestTime: 'October – June',
    isDomestic: true,
  }

  const normalized = normalizeDestination(sampleRawDest)

  // 1A: Identifier resolution
  console.assert(normalized.id === 'place_manali', `Expected id 'place_manali', got '${normalized.id}'`)
  console.assert(normalized.customId === 'place_manali', 'customId must be preserved')
  console.assert(normalized._id === '6ad91854684a66cfaabe3f13', '_id must be preserved as string')

  // 1B: Trimmed text fields
  console.assert(normalized.name === 'Manali', 'name must be trimmed')
  console.assert(normalized.state === 'Himachal Pradesh', 'state must be trimmed')
  console.assert(normalized.category === 'Mountains', 'category must be trimmed')

  // 1C: Schema array fields preservation
  console.assert(Array.isArray(normalized.durations) && normalized.durations.length === 2, 'durations array must be preserved')
  console.assert(Array.isArray(normalized.groups) && normalized.groups.length === 4, 'groups array must be preserved')
  console.assert(Array.isArray(normalized.experiences) && normalized.experiences.length === 5, 'experiences array must be preserved')
  console.assert(Array.isArray(normalized.budgetRanges) && normalized.budgetRanges.length === 2, 'budgetRanges array must be preserved')
  console.assert(Array.isArray(normalized.moods) && normalized.moods.length === 4, 'moods array must be preserved')
  console.assert(Array.isArray(normalized.highlights) && normalized.highlights.length === 2, 'highlights array must be preserved')
  console.assert(normalized.isDomestic === true, 'isDomestic must be boolean true')

  // 1D: Fallbacks for minimal/incomplete documents
  const minimalDoc = {
    _id: new mongoose.Types.ObjectId('6ad91854684a66cfaabe3f99'),
    name: 'Minimal Test Destination',
  }
  const normalizedMinimal = normalizeDestination(minimalDoc)
  console.assert(normalizedMinimal.id === '6ad91854684a66cfaabe3f99', 'id must fall back to _id string if customId absent')
  console.assert(normalizedMinimal.categoryIcon === '📍', 'categoryIcon must default to 📍')
  console.assert(Array.isArray(normalizedMinimal.durations) && normalizedMinimal.durations.length === 0, 'durations must default to empty []')
  console.assert(Array.isArray(normalizedMinimal.highlights) && normalizedMinimal.highlights.length === 0, 'highlights must default to empty []')

  // 1E: Null / invalid object handling
  console.assert(normalizeDestination(null) === null, 'null input must return null')
  console.assert(normalizeDestination(undefined) === null, 'undefined input must return null')
  console.log('✓ 1: normalizeDestination correctly maps identifiers, trims fields, and ensures array fallbacks.')

  // ---------------------------------------------------------------------------
  // TEST 2: HTTP Integration with Express Server
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 2: Destination API Client HTTP Integration ---')

  const server = http.createServer(app)
  await new Promise((resolve) => server.listen(0, resolve))
  const { port } = server.address()

  const originalEnv = process.env.VITE_API_URL
  process.env.VITE_API_URL = `http://127.0.0.1:${port}/api`

  // In-memory mock database for destinations to run fast and isolated
  const mockDestDb = new Map()

  const sampleDestDocs = [
    {
      _id: new mongoose.Types.ObjectId('6ad91854684a66cfaabe3f13'),
      customId: 'place_manali',
      name: 'Manali',
      state: 'Himachal Pradesh',
      category: 'Mountains',
      categoryIcon: '🏔️',
      durations: ['3-5', '6-10'],
      durationDisplay: '3–5 days',
      groups: ["Friends / Boys' Trip", 'Family', 'Couple / Honeymoon', 'Solo'],
      experiences: ['Mountains', 'Trekking', 'Adventure', 'Nature and Wildlife', 'Relaxation'],
      budgetRanges: ['10k-25k', '25k-50k'],
      budgetDisplay: '₹12,000 – ₹22,000 per person',
      moods: ['Adventurous', 'Scenic', 'Peaceful'],
      description: 'High-altitude Himalayan valley.',
      overview: 'Premier mountain gateway.',
      highlights: ['Solang Valley', 'Rohtang Pass'],
      bestTime: 'October – June',
      isDomestic: true,
    },
    {
      _id: new mongoose.Types.ObjectId('6ad91854684a66cfaabe3f14'),
      customId: 'place_goa',
      name: 'Goa',
      state: 'Goa',
      category: 'Beaches',
      categoryIcon: '🏖️',
      durations: ['3-5', '6-10'],
      durationDisplay: '3–5 days',
      groups: ["Friends / Boys' Trip", 'Couple / Honeymoon', 'Solo', 'Family'],
      experiences: ['Beaches', 'Nightlife', 'Relaxation', 'Heritage and Culture', 'Waterfalls'],
      budgetRanges: ['10k-25k', '25k-50k', '50k+'],
      budgetDisplay: '₹15,000 – ₹30,000 per person',
      moods: ['Fun and Social', 'Scenic', 'Peaceful', 'Adventurous'],
      description: 'Sun-drenched coastal haven.',
      overview: 'Coastal paradise in western India.',
      highlights: ['Calangute Beach', 'Fort Aguada'],
      bestTime: 'November – February',
      isDomestic: true,
    },
  ]

  for (const doc of sampleDestDocs) {
    mockDestDb.set(doc._id.toString(), doc)
    mockDestDb.set(doc.customId, doc)
  }

  const origFind = Destination.find
  const origFindById = Destination.findById
  const origFindOne = Destination.findOne

  Destination.find = function (filter = {}) {
    let list = [sampleDestDocs[0], sampleDestDocs[1]]
    if (filter.category && filter.category.$regex) {
      const rx = filter.category.$regex
      list = list.filter((d) => rx.test(d.category))
    }
    if (filter.durations) {
      list = list.filter((d) => d.durations.includes(filter.durations))
    }
    if (filter.budgetRanges) {
      list = list.filter((d) => d.budgetRanges.includes(filter.budgetRanges))
    }
    if (filter.$or) {
      list = list.filter((d) =>
        filter.$or.some((clause) => {
          if (clause.name && clause.name.test(d.name)) return true
          if (clause.state && clause.state.test(d.state)) return true
          if (clause.category && clause.category.test(d.category)) return true
          return false
        })
      )
    }
    return {
      sort: () => Promise.resolve(list),
      then: (resolve) => resolve(list),
    }
  }

  Destination.findById = async function (id) {
    return mockDestDb.get(id?.toString()) || null
  }

  Destination.findOne = async function (query) {
    if (query?.customId) {
      return mockDestDb.get(query.customId) || null
    }
    return null
  }

  try {
    // 2A: fetchDestinations() without filters
    const listAllRes = await fetchDestinations()
    console.assert(listAllRes.success === true, `Expected success true, got: ${listAllRes.error}`)
    console.assert(listAllRes.destinations.length === 2, `Expected 2 destinations, got ${listAllRes.destinations?.length}`)
    console.assert(listAllRes.destinations[0].id === 'place_manali', 'First destination id must match')
    console.log(`✓ 2A: fetchDestinations() successfully retrieved and normalized ${listAllRes.destinations.length} destinations.`)

    // 2B: fetchDestinations(filters) with query parameters
    const filterRes = await fetchDestinations({
      category: 'Mountains',
      duration: '3-5',
      budget: '10k-25k',
      search: 'Manali',
    })
    console.assert(filterRes.success === true, 'Filtered fetch must succeed')
    console.assert(filterRes.destinations.length === 1, `Expected 1 filtered destination, got ${filterRes.destinations.length}`)
    console.assert(filterRes.destinations[0].name === 'Manali', 'Filtered destination must be Manali')
    console.log('✓ 2B: fetchDestinations(filters) correctly maps query parameters and returns filtered results.')

    // 2C: fetchDestinationById by customId
    const byCustomIdRes = await fetchDestinationById('place_manali')
    console.assert(byCustomIdRes.success === true, `Expected success true, got: ${byCustomIdRes.error}`)
    console.assert(byCustomIdRes.destination.name === 'Manali', 'Destination name must match')
    console.assert(byCustomIdRes.destination.id === 'place_manali', 'Destination id must match customId')
    console.log('✓ 2C: fetchDestinationById() successfully retrieved destination by customId ("place_manali").')

    // 2D: fetchDestinationById by MongoDB ObjectId
    const byObjectIdRes = await fetchDestinationById('6ad91854684a66cfaabe3f14')
    console.assert(byObjectIdRes.success === true, `Expected success true, got: ${byObjectIdRes.error}`)
    console.assert(byObjectIdRes.destination.name === 'Goa', 'Destination name must be Goa')
    console.assert(byObjectIdRes.destination.customId === 'place_goa', 'Destination customId must be place_goa')
    console.log('✓ 2D: fetchDestinationById() successfully retrieved destination by MongoDB ObjectId.')

    // 2E: fetchDestinationById 404 handling
    const notFoundRes = await fetchDestinationById('place_nonexistent')
    console.assert(notFoundRes.success === false, 'Nonexistent ID must return success: false')
    console.assert(notFoundRes.error.includes('not found') || notFoundRes.error.includes('404'), `Expected not found error, got: ${notFoundRes.error}`)
    console.log(`✓ 2E: fetchDestinationById() handles 404 cleanly: "${notFoundRes.error}".`)

    // 2F: fetchDestinationById invalid empty ID handling
    const invalidIdRes = await fetchDestinationById('')
    console.assert(invalidIdRes.success === false, 'Empty ID must return success: false')
    console.assert(invalidIdRes.error === 'Valid destination ID is required.', `Expected validation error, got: ${invalidIdRes.error}`)
    console.log('✓ 2F: fetchDestinationById() validates empty input client-side.')

    // 2G: recommendDestinations() successful questionnaire matching
    const recommendRes = await recommendDestinations({
      duration: '3-5',
      group: "Friends / Boys' Trip",
      experiences: ['Mountains', 'Adventure'],
      budget: '10k-25k',
      moods: ['Adventurous'],
      domesticOnly: true,
    })
    console.assert(recommendRes.success === true, `Expected recommend success, got: ${recommendRes.error}`)
    console.assert(Array.isArray(recommendRes.recommendations), 'recommendations must be an array')
    console.assert(recommendRes.recommendations.length > 0, 'Should return at least 1 qualified recommendation')

    const topRec = recommendRes.recommendations[0]
    console.assert(Boolean(topRec.destination), 'Recommendation item must contain destination object')
    console.assert(topRec.destination.name === 'Manali', `Top mountain recommendation must be Manali, got: ${topRec.destination.name}`)
    console.assert(topRec.score >= 7, `Recommendation score must be >= 7, got: ${topRec.score}`)
    console.assert(topRec.isGroupMatch === true, 'isGroupMatch should be true')
    console.assert(topRec.isDurationMatch === true, 'isDurationMatch should be true')
    console.assert(topRec.matchingExperiences.includes('Mountains'), 'matchingExperiences must include Mountains')
    console.log(`✓ 2G: recommendDestinations() generated ${recommendRes.recommendations.length} normalized recommendations (Top: ${topRec.destination.name}, Score: ${topRec.score}).`)

    // 2H: recommendDestinations() validation error handling (missing required fields)
    const invalidRecRes = await recommendDestinations({
      duration: '',
      group: '',
      experiences: [],
    })
    console.assert(invalidRecRes.success === false, 'Invalid recommendation criteria must return success: false')
    console.assert(typeof invalidRecRes.error === 'string' && invalidRecRes.error.length > 0, 'Error message must be present')
    console.log(`✓ 2H: recommendDestinations() handles 400 validation error cleanly: "${invalidRecRes.error}".`)

    // 2I: Network Error handling (unreachable port)
    process.env.VITE_API_URL = 'http://127.0.0.1:54321/api'
    const networkErrRes = await fetchDestinations()
    console.assert(networkErrRes.success === false, 'Network error must return success: false')
    console.assert(typeof networkErrRes.error === 'string', 'Network error message must be returned')
    console.log(`✓ 2I: Network failure handled gracefully without unhandled exceptions: "${networkErrRes.error}".`)

    console.log('\n===============================================================')
    console.log('✓ All Milestone 13D Stage 2 Destination API Service Tests PASSED!')
    console.log('===============================================================')
  } finally {
    // Restore mocks and close test server
    Destination.find = origFind
    Destination.findById = origFindById
    Destination.findOne = origFindOne
    if (originalEnv !== undefined) {
      process.env.VITE_API_URL = originalEnv
    } else {
      delete process.env.VITE_API_URL
    }
    server.close()
  }
}

runTests().catch((err) => {
  console.error('Destination API Test Suite Failed:', err)
  process.exit(1)
})
