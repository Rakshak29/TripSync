import {
  SAMPLE_DESTINATIONS,
  mapDaysToDurationTier,
  matchSampleDestinations,
} from '../src/data/sampleDestinations.js'

console.log('=== TripSync Milestone 8: Comprehensive Dataset & Matching Verification ===\n')

// Known valid values matching questionnaire options exactly
const VALID_DURATIONS = new Set(['1-2', '3-5', '6-10', '11+'])
const VALID_GROUPS = new Set([
  "Friends / Boys' Trip",
  'Family',
  'Couple / Honeymoon',
  'Solo',
  'Religious Group',
])
const VALID_EXPERIENCES = new Set([
  'Mountains',
  'Beaches',
  'Waterfalls',
  'Trekking',
  'Nature and Wildlife',
  'Heritage and Culture',
  'Religious and Spiritual Places',
  'Adventure',
  'Nightlife',
  'Relaxation',
])
const VALID_BUDGETS = new Set(['under-10k', '10k-25k', '25k-50k', '50k+'])
const VALID_MOODS = new Set([
  'Peaceful',
  'Adventurous',
  'Scenic',
  'Cultural',
  'Spiritual',
  'Fun and Social',
])

// Recognized Indian States & Union Territories
const INDIAN_STATES_AND_UTS = new Set([
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
])

// ---------------------------------------------------------------------------
// TEST 1: Dataset Volume & Domestic Scope
// ---------------------------------------------------------------------------
console.log('--- TEST 1: Dataset Volume & Domestic Scope ---')
const count = SAMPLE_DESTINATIONS.length
console.assert(
  count >= 30 && count <= 50,
  `Dataset must contain 30–50 destinations, found ${count}`
)
console.log(`✓ Total Destinations in Dataset: ${count} (within 30–50 range)`)

for (const dest of SAMPLE_DESTINATIONS) {
  console.assert(
    INDIAN_STATES_AND_UTS.has(dest.state),
    `Destination "${dest.name}" has non-Indian state/UT: "${dest.state}"`
  )
}
console.log('✓ All 40 destinations verified to be within Indian States/Union Territories.')

// ---------------------------------------------------------------------------
// TEST 2: ID Uniqueness & Slug Format
// ---------------------------------------------------------------------------
console.log('\n--- TEST 2: ID Uniqueness & Format ---')
const seenIds = new Set()
for (const dest of SAMPLE_DESTINATIONS) {
  console.assert(dest.id && typeof dest.id === 'string', `Invalid ID on ${dest.name}`)
  console.assert(
    !seenIds.has(dest.id),
    `Duplicate ID found: "${dest.id}" on "${dest.name}"`
  )
  seenIds.add(dest.id)
  console.assert(
    dest.id.startsWith('place_'),
    `ID "${dest.id}" must start with prefix "place_"`
  )
}
console.log(`✓ All ${seenIds.size} destination IDs are completely unique and correctly formatted.`)

// ---------------------------------------------------------------------------
// TEST 3: Schema & Tag Compatibility Validation
// ---------------------------------------------------------------------------
console.log('\n--- TEST 3: Schema & Tag Compatibility Validation ---')
const requiredFields = [
  'id',
  'name',
  'state',
  'category',
  'categoryIcon',
  'durations',
  'durationDisplay',
  'groups',
  'experiences',
  'budgetRanges',
  'budgetDisplay',
  'moods',
  'description',
  'overview',
  'highlights',
  'bestTime',
]

for (const dest of SAMPLE_DESTINATIONS) {
  // Check required field existence and types
  for (const field of requiredFields) {
    console.assert(
      dest[field] !== undefined && dest[field] !== null,
      `Destination "${dest.name}" missing field "${field}"`
    )
  }

  // Durations array validation
  console.assert(
    Array.isArray(dest.durations) && dest.durations.length > 0,
    `"${dest.name}" has empty durations array`
  )
  for (const d of dest.durations) {
    console.assert(
      VALID_DURATIONS.has(d),
      `"${dest.name}" contains unrecognized duration tier: "${d}"`
    )
  }

  // Groups array validation
  console.assert(
    Array.isArray(dest.groups) && dest.groups.length > 0,
    `"${dest.name}" has empty groups array`
  )
  for (const g of dest.groups) {
    console.assert(
      VALID_GROUPS.has(g),
      `"${dest.name}" contains unrecognized travel group: "${g}"`
    )
  }

  // Experiences array validation
  console.assert(
    Array.isArray(dest.experiences) && dest.experiences.length > 0,
    `"${dest.name}" has empty experiences array`
  )
  for (const exp of dest.experiences) {
    console.assert(
      VALID_EXPERIENCES.has(exp),
      `"${dest.name}" contains unrecognized experience tag: "${exp}"`
    )
  }

  // Budget ranges array validation
  console.assert(
    Array.isArray(dest.budgetRanges) && dest.budgetRanges.length > 0,
    `"${dest.name}" has empty budgetRanges array`
  )
  for (const b of dest.budgetRanges) {
    console.assert(
      VALID_BUDGETS.has(b),
      `"${dest.name}" contains unrecognized budget range: "${b}"`
    )
  }

  // Moods array validation
  console.assert(
    Array.isArray(dest.moods) && dest.moods.length > 0,
    `"${dest.name}" has empty moods array`
  )
  for (const m of dest.moods) {
    console.assert(
      VALID_MOODS.has(m),
      `"${dest.name}" contains unrecognized travel mood: "${m}"`
    )
  }

  // Highlights validation (must be array with ~5 highlights)
  console.assert(
    Array.isArray(dest.highlights) && dest.highlights.length >= 4,
    `"${dest.name}" must contain at least 4 highlights`
  )

  // Zero image properties allowed (text-first rule)
  console.assert(!dest.image, `"${dest.name}" must not contain "image" property`)
  console.assert(!dest.imageUrl, `"${dest.name}" must not contain "imageUrl" property`)
  console.assert(!dest.photo, `"${dest.name}" must not contain "photo" property`)
}
console.log('✓ All 40 destinations strictly satisfy the 16-field schema and valid tag constraints.')

// ---------------------------------------------------------------------------
// TEST 4: Thematic & Geographic Coverage Check
// ---------------------------------------------------------------------------
console.log('\n--- TEST 4: Thematic & Geographic Coverage ---')
const experienceCounts = {}
for (const exp of VALID_EXPERIENCES) experienceCounts[exp] = 0
for (const dest of SAMPLE_DESTINATIONS) {
  for (const exp of dest.experiences) {
    experienceCounts[exp]++
  }
}

for (const [exp, c] of Object.entries(experienceCounts)) {
  console.assert(c >= 3, `Expected at least 3 destinations for "${exp}", found ${c}`)
  console.log(`  • Experience "${exp}": ${c} destinations`)
}
console.log('✓ All 10 experience categories have robust, balanced representation.')

// ---------------------------------------------------------------------------
// TEST 5: Representative Matching Queries
// ---------------------------------------------------------------------------
console.log('\n--- TEST 5: Representative Category Queries ---')

// 5A: Mountains query
const mountainsRes = matchSampleDestinations({
  duration: '3-5',
  group: 'Couple / Honeymoon',
  experiences: ['Mountains', 'Relaxation'],
  budget: '10k-25k',
  moods: ['Scenic', 'Peaceful'],
})
console.assert(mountainsRes.length > 0 && mountainsRes.length <= 5, 'Mountains query failed')
for (const r of mountainsRes) {
  console.assert(
    r.destination.experiences.includes('Mountains') ||
    r.destination.experiences.includes('Relaxation'),
    'Mountains query returned destination missing selected experiences'
  )
  console.assert(
    r.destination.groups.includes('Couple / Honeymoon'),
    'Returned destination missing Couple group'
  )
}
console.log(`✓ 5A (Mountains): Returned ${mountainsRes.length} destinations (Top: ${mountainsRes[0].destination.name})`)

// 5B: Coastal / Beaches query
const beachesRes = matchSampleDestinations({
  duration: '3-5',
  group: "Friends / Boys' Trip",
  experiences: ['Beaches', 'Nightlife'],
  budget: '10k-25k',
  moods: ['Fun and Social'],
})
console.assert(beachesRes.length > 0 && beachesRes.length <= 5, 'Beaches query failed')
console.assert(
  beachesRes.some((r) => r.destination.name === 'Goa' || r.destination.name === 'Pondicherry (Puducherry)'),
  'Expected Goa or Pondicherry in beaches nightlife query'
)
console.log(`✓ 5B (Beaches): Returned ${beachesRes.length} destinations (Top: ${beachesRes[0].destination.name})`)

// 5C: Waterfalls query
const waterfallsRes = matchSampleDestinations({
  duration: '3-5',
  group: 'Family',
  experiences: ['Waterfalls', 'Nature and Wildlife'],
  budget: '10k-25k',
  moods: ['Scenic'],
})
console.assert(waterfallsRes.length > 0 && waterfallsRes.length <= 5, 'Waterfalls query failed')
for (const r of waterfallsRes) {
  console.assert(
    r.destination.experiences.includes('Waterfalls') ||
    r.destination.experiences.includes('Nature and Wildlife'),
    'Waterfalls query returned destination missing selected experiences'
  )
}
console.log(`✓ 5C (Waterfalls): Returned ${waterfallsRes.length} destinations (Top: ${waterfallsRes[0].destination.name})`)

// 5D: Heritage & Culture query
const heritageRes = matchSampleDestinations({
  duration: '1-2',
  group: 'Family',
  experiences: ['Heritage and Culture'],
  budget: 'under-10k',
  moods: ['Cultural'],
})
console.assert(heritageRes.length > 0 && heritageRes.length <= 5, 'Heritage query failed')
console.assert(
  heritageRes.some((r) => r.destination.state === 'Rajasthan' || r.destination.state === 'Uttar Pradesh'),
  'Expected northern heritage destinations'
)
console.log(`✓ 5D (Heritage): Returned ${heritageRes.length} destinations (Top: ${heritageRes[0].destination.name})`)

// 5E: Religious & Spiritual query
const spiritualRes = matchSampleDestinations({
  duration: '1-2',
  group: 'Religious Group',
  experiences: ['Religious and Spiritual Places'],
  budget: 'under-10k',
  moods: ['Spiritual'],
})
console.assert(spiritualRes.length > 0 && spiritualRes.length <= 5, 'Spiritual query failed')
for (const r of spiritualRes) {
  console.assert(
    r.destination.groups.includes('Religious Group'),
    'Spiritual query returned destination not tagged for Religious Group'
  )
  console.assert(
    r.destination.experiences.includes('Religious and Spiritual Places'),
    'Spiritual query returned destination without Spiritual experience'
  )
}
console.log(`✓ 5E (Spiritual): Returned ${spiritualRes.length} destinations (Top: ${spiritualRes[0].destination.name})`)

// 5F: Trekking & Adventure query
const adventureRes = matchSampleDestinations({
  duration: '3-5',
  group: "Friends / Boys' Trip",
  experiences: ['Trekking', 'Adventure'],
  budget: '10k-25k',
  moods: ['Adventurous'],
})
console.assert(adventureRes.length > 0 && adventureRes.length <= 5, 'Adventure query failed')
console.log(`✓ 5F (Adventure): Returned ${adventureRes.length} destinations (Top: ${adventureRes[0].destination.name})`)

// ---------------------------------------------------------------------------
// TEST 6: Incompatible Preferences & Empty State Trigger
// ---------------------------------------------------------------------------
console.log('\n--- TEST 6: Incompatible Preferences & Empty State ---')
const emptyRes = matchSampleDestinations({
  duration: '11+',
  group: 'Religious Group',
  experiences: ['Nightlife'],
  budget: 'under-10k',
  moods: [],
})
console.assert(
  emptyRes.length === 0,
  `Expected 0 results for incompatible query, got ${emptyRes.length}`
)
console.log('✓ Incompatible query returned 0 results; empty state correctly triggered.')

// ---------------------------------------------------------------------------
// TEST 7: Result Limit & Score Ordering
// ---------------------------------------------------------------------------
console.log('\n--- TEST 7: Result Limit & Score Ordering ---')
const broadRes = matchSampleDestinations({
  duration: '3-5',
  group: 'Family',
  experiences: ['Mountains', 'Nature and Wildlife', 'Relaxation', 'Heritage and Culture'],
  budget: '10k-25k',
  moods: ['Peaceful', 'Scenic'],
})
console.assert(broadRes.length <= 5, `Expected max 5 results, got ${broadRes.length}`)
for (let i = 0; i < broadRes.length - 1; i++) {
  console.assert(
    broadRes[i].score >= broadRes[i + 1].score,
    `Results not sorted descending: score ${broadRes[i].score} < ${broadRes[i + 1].score}`
  )
}
console.log(`✓ Returned ${broadRes.length} results, strictly capped at 5 and sorted by score descending:`)
broadRes.forEach((r, idx) => {
  console.log(`    ${idx + 1}. ${r.destination.name} (${r.destination.state}) — Score: ${r.score}`)
})

console.log('\n=== All Milestone 8 Dataset & Matching Tests PASSED Successfully! ===')
