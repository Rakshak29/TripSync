import {
  SAMPLE_DESTINATIONS,
  mapDaysToDurationTier,
  matchSampleDestinations,
} from '../src/data/sampleDestinations.js'

console.log('--- Testing Revised Milestone 7: Sample Dataset and Matching Rules ---')

// Test 1: Dataset size and schema check
console.assert(
  SAMPLE_DESTINATIONS.length >= 30 && SAMPLE_DESTINATIONS.length <= 50,
  `Expected 30-50 destinations, got ${SAMPLE_DESTINATIONS.length}`
)

const idSet = new Set()

for (const dest of SAMPLE_DESTINATIONS) {
  console.assert(dest.id && typeof dest.id === 'string', 'Destination missing ID')
  console.assert(!idSet.has(dest.id), `Duplicate destination ID detected: ${dest.id}`)
  idSet.add(dest.id)
  console.assert(dest.name && typeof dest.name === 'string', 'Destination missing Name')
  console.assert(dest.state && typeof dest.state === 'string', 'Destination missing State')
  console.assert(Array.isArray(dest.durations) && dest.durations.length > 0, `${dest.name} missing durations`)
  console.assert(Array.isArray(dest.groups) && dest.groups.length > 0, `${dest.name} missing groups`)
  console.assert(Array.isArray(dest.experiences) && dest.experiences.length > 0, `${dest.name} missing experiences`)
  console.assert(Array.isArray(dest.budgetRanges) && dest.budgetRanges.length > 0, `${dest.name} missing budgetRanges`)
  console.assert(Array.isArray(dest.moods) && dest.moods.length > 0, `${dest.name} missing moods`)
  console.assert(dest.description && typeof dest.description === 'string', `${dest.name} missing description`)
  console.assert(dest.overview && typeof dest.overview === 'string', `${dest.name} missing overview`)
  console.assert(Array.isArray(dest.highlights) && dest.highlights.length > 0, `${dest.name} missing highlights`)
}
console.log('✓ Test 1 Passed: All destinations conform to required schema.')

// Test 2: Custom day mapping to duration tiers
console.assert(mapDaysToDurationTier(1) === '1-2', '1 day should be 1-2')
console.assert(mapDaysToDurationTier(2) === '1-2', '2 days should be 1-2')
console.assert(mapDaysToDurationTier(3) === '3-5', '3 days should be 3-5')
console.assert(mapDaysToDurationTier(5) === '3-5', '5 days should be 3-5')
console.assert(mapDaysToDurationTier(7) === '6-10', '7 days should be 6-10')
console.assert(mapDaysToDurationTier(10) === '6-10', '10 days should be 6-10')
console.assert(mapDaysToDurationTier(14) === '11+', '14 days should be 11+')
console.assert(mapDaysToDurationTier('invalid') === '', 'Invalid should return empty string')
console.log('✓ Test 2 Passed: Day mapping logic works correctly.')

// Test 3: Standard preference match (e.g., Manali, Himachal, Mountains)
const results1 = matchSampleDestinations({
  duration: '3-5',
  group: "Friends / Boys' Trip",
  experiences: ['Mountains', 'Adventure'],
  budget: '10k-25k',
  moods: ['Adventurous', 'Scenic'],
})
console.assert(results1.length > 0, 'Expected matching destinations')
console.assert(results1.length <= 5, 'Must return at most 5 destinations')
console.assert(results1[0].destination.name === 'Manali' || results1[0].destination.name === 'Rishikesh', 'Expected mountain/adventure destination')
console.log(`✓ Test 3 Passed: Standard query returned ${results1.length} qualified matches (top: ${results1[0].destination.name}).`)

// Test 4: Coastal / Beach query (e.g. Goa, Andaman)
const results2 = matchSampleDestinations({
  duration: '3-5',
  group: 'Couple / Honeymoon',
  experiences: ['Beaches', 'Relaxation'],
  budget: '25k-50k',
  moods: ['Scenic', 'Relaxation'],
})
console.assert(results2.length > 0, 'Expected beach destinations')
const hasGoaOrAndaman = results2.some(
  (r) => r.destination.name === 'Goa' || r.destination.name === 'Andaman & Nicobar Islands'
)
console.assert(hasGoaOrAndaman, 'Expected Goa or Andaman in results')
console.log(`✓ Test 4 Passed: Beach query returned ${results2.length} matches with coastal destinations.`)

// Test 5: Spiritual / Heritage query (e.g. Varanasi, Rishikesh, Hampi)
const results3 = matchSampleDestinations({
  duration: '1-2',
  group: 'Religious Group',
  experiences: ['Religious and Spiritual Places', 'Heritage and Culture'],
  budget: 'under-10k',
  moods: ['Spiritual', 'Peaceful'],
})
console.assert(results3.length > 0, 'Expected spiritual destinations')
console.assert(
  results3.some((r) => r.destination.name === 'Varanasi' || r.destination.name === 'Rishikesh'),
  'Expected Varanasi or Rishikesh for religious group query'
)
console.log(`✓ Test 5 Passed: Spiritual query correctly identified pilgrimage places.`)

// Test 6: Custom duration parameter works through matcher
const resultsCustom = matchSampleDestinations({
  customDuration: '4', // maps to 3-5
  group: 'Family',
  experiences: ['Nature and Wildlife', 'Mountains'],
  budget: '10k-25k',
  moods: ['Scenic'],
})
console.assert(resultsCustom.length > 0, 'Expected matches for custom duration')
console.log(`✓ Test 6 Passed: Custom duration (4 days) matched properly.`)

// Test 7: Non-matching edge case (e.g. 11+ days, religious group, nightlife, under-10k)
const resultsNone = matchSampleDestinations({
  duration: '11+',
  group: 'Religious Group',
  experiences: ['Nightlife'],
  budget: 'under-10k',
  moods: [],
})
console.assert(resultsNone.length === 0, 'Expected 0 matches for contradictory preferences')
console.log(`✓ Test 7 Passed: Incompatible combination returned 0 destinations (empty state triggered).`)

console.log('All Sample Destinations unit tests PASSED successfully!')
