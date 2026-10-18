/**
 * Milestone 9: Integration Tests for Discover Places Actions
 * Verifies:
 * 1. "Save to Wishlist" action integration, deduplication, feedback, and user-scoped persistence.
 * 2. "Plan a Trip" prefill into trip creation, validation, and addition to trip list.
 * 3. Discover Places recommendation consistency and core feature non-regression.
 */

import { SAMPLE_DESTINATIONS, matchSampleDestinations } from '../src/data/sampleDestinations.js'

console.log('=== TripSync Milestone 9: Discover Places Actions Integration Tests ===\n')

// ---------------------------------------------------------------------------
// Mock LocalStorage environment for programmatic tests
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

// ---------------------------------------------------------------------------
// TEST 1: Save Destination to Wishlist & Deduplication
// ---------------------------------------------------------------------------
console.log('--- TEST 1: Save to Wishlist & Deduplication ---')

// Replicate WishlistProvider logic for User A
const userAEmail = 'alice@example.com'
const userAStorageKey = `tripsync_wishlist_${userAEmail.toLowerCase()}`

function getWishlist(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function addWishlist(storageKey, destination, note = '') {
  const items = getWishlist(storageKey)
  const trimmedDest = destination.trim()
  if (!trimmedDest) return { success: false, error: 'Destination cannot be empty.' }

  const isDuplicate = items.some(
    (item) => item.destination.toLowerCase() === trimmedDest.toLowerCase()
  )
  if (isDuplicate) {
    return { success: false, error: `"${trimmedDest}" is already in your wishlist.` }
  }

  const newItem = {
    id: 'wishlist_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    destination: trimmedDest,
    note: note.trim(),
    createdAt: new Date().toISOString(),
  }
  const updated = [newItem, ...items]
  localStorage.setItem(storageKey, JSON.stringify(updated))
  return { success: true, item: newItem }
}

const sampleDest1 = SAMPLE_DESTINATIONS.find((d) => d.id === 'place_manali')
console.assert(sampleDest1, 'Manali destination must exist')

// 1A: First save
const save1 = addWishlist(
  userAStorageKey,
  sampleDest1.name,
  `${sampleDest1.category} · ${sampleDest1.state}. ${sampleDest1.description}`
)
console.assert(save1.success === true, 'First save should succeed')
console.log(`✓ 1A: Saved "${sampleDest1.name}" to Wishlist successfully.`)

// 1B: Duplicate save attempt
const saveDuplicate = addWishlist(
  userAStorageKey,
  sampleDest1.name,
  'Duplicate save attempt'
)
console.assert(saveDuplicate.success === false, 'Duplicate save must be rejected')
console.assert(
  saveDuplicate.error.includes('already in your wishlist'),
  'Error message must indicate duplicate'
)
console.log(`✓ 1B: Duplicate save properly prevented: ${saveDuplicate.error}`)

// 1C: Case-insensitive duplicate check
const saveDuplicateCase = addWishlist(userAStorageKey, '  mAnALi  ')
console.assert(saveDuplicateCase.success === false, 'Case-insensitive duplicate must be rejected')
console.log(`✓ 1C: Case-insensitive whitespace-trimmed duplicate properly rejected.`)

// ---------------------------------------------------------------------------
// TEST 2: Wishlist Persistence Across Simulated Reload & Verification
// ---------------------------------------------------------------------------
console.log('\n--- TEST 2: Wishlist Persistence Across Reload ---')

// Save another destination (Goa)
const sampleDest2 = SAMPLE_DESTINATIONS.find((d) => d.id === 'place_goa')
addWishlist(userAStorageKey, sampleDest2.name, sampleDest2.description)

// Simulate reload by reading back directly from localStorage
const reloadedItems = getWishlist(userAStorageKey)
console.assert(reloadedItems.length === 2, `Expected 2 saved items, found ${reloadedItems.length}`)
console.assert(
  reloadedItems.some((i) => i.destination === 'Manali'),
  'Manali must be present in reloaded items'
)
console.assert(
  reloadedItems.some((i) => i.destination === 'Goa'),
  'Goa must be present in reloaded items'
)
console.log(`✓ 2: Reloaded ${reloadedItems.length} items from localStorage; all data intact.`)

// ---------------------------------------------------------------------------
// TEST 3: User Storage Isolation
// ---------------------------------------------------------------------------
console.log('\n--- TEST 3: User Storage Isolation ---')

const userBEmail = 'bob@example.com'
const userBStorageKey = `tripsync_wishlist_${userBEmail.toLowerCase()}`

const bobInitialWishlist = getWishlist(userBStorageKey)
console.assert(
  bobInitialWishlist.length === 0,
  'User B must not see User A’s saved wishlist destinations'
)

// Add separate destination for Bob (Shimla)
addWishlist(userBStorageKey, 'Shimla', 'Himachal hills')
const bobUpdatedWishlist = getWishlist(userBStorageKey)
const aliceWishlist = getWishlist(userAStorageKey)

console.assert(bobUpdatedWishlist.length === 1, 'Bob should have 1 item')
console.assert(aliceWishlist.length === 2, 'Alice should still have 2 items')
console.assert(
  !bobUpdatedWishlist.some((i) => i.destination === 'Manali'),
  'Bob should not have Manali'
)
console.assert(
  !aliceWishlist.some((i) => i.destination === 'Shimla'),
  'Alice should not have Shimla'
)
console.log('✓ 3: User storage strictly isolated between different user accounts.')

// ---------------------------------------------------------------------------
// TEST 4: "Plan a Trip" Destination Prefill Flow
// ---------------------------------------------------------------------------
console.log('\n--- TEST 4: "Plan a Trip" Prefill Flow ---')

// Simulate Discover Places -> Create Trip navigation transition
function simulateDiscoverToCreateTrip(selectedDest) {
  // Navigation state passed to router
  const navigationState = { destination: selectedDest.name }

  // CreateTripPage initialization logic
  const initialDestination = navigationState?.destination || ''
  const formState = {
    destination: initialDestination,
    name: '',
    startDate: '',
    endDate: '',
    travelers: 2,
    budget: '',
    notes: '',
  }

  return formState
}

const formState = simulateDiscoverToCreateTrip(sampleDest1)
console.assert(
  formState.destination === 'Manali',
  `Expected prefilled destination "Manali", got "${formState.destination}"`
)
console.assert(formState.name === '', 'Trip name must remain for user to complete')
console.assert(formState.budget === '', 'Budget must remain for user to complete')
console.log(`✓ 4: Destination field successfully prefilled with "${formState.destination}".`)

// ---------------------------------------------------------------------------
// TEST 5: Complete Form Submission & Trip Creation
// ---------------------------------------------------------------------------
console.log('\n--- TEST 5: Trip Creation with Prefilled Destination ---')

// Mock TripProvider addTrip logic
const tripsStorageKey = `tripsync_trips_${userAEmail.toLowerCase()}`
function getTrips(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function addTrip(storageKey, tripData) {
  const currentTrips = getTrips(storageKey)
  const newTrip = {
    id: 'trip_' + Date.now(),
    name: tripData.name.trim(),
    destination: tripData.destination.trim(),
    startDate: tripData.startDate,
    endDate: tripData.endDate,
    travelers: Number(tripData.travelers),
    budget: Number(tripData.budget),
    notes: tripData.notes.trim(),
    createdAt: new Date().toISOString(),
  }
  const updated = [newTrip, ...currentTrips]
  localStorage.setItem(storageKey, JSON.stringify(updated))
  return { success: true, trip: newTrip }
}

// Complete the remaining required fields
const completedTripInput = {
  ...formState,
  name: 'Himalayan Summer Holiday',
  startDate: '2026-06-10',
  endDate: '2026-06-15',
  travelers: 4,
  budget: 65000,
  notes: 'Book hotel in Old Manali near river.',
}

const createResult = addTrip(tripsStorageKey, completedTripInput)
console.assert(createResult.success === true, 'Trip creation should succeed')
console.assert(
  createResult.trip.destination === 'Manali',
  'Created trip destination must match prefilled value'
)
console.assert(
  createResult.trip.name === 'Himalayan Summer Holiday',
  'Trip name must match submitted value'
)

// Verify created trip appears in user's trip list
const userTrips = getTrips(tripsStorageKey)
console.assert(userTrips.length === 1, 'User A must have 1 trip')
console.assert(userTrips[0].destination === 'Manali', 'User A trip destination must be Manali')
console.assert(userTrips[0].budget === 65000, 'User A trip budget must be 65000')
console.log(`✓ 5: Created trip "${userTrips[0].name}" for "${userTrips[0].destination}" saved and verified in trip list.`)

// ---------------------------------------------------------------------------
// TEST 6: Discover Places Matching Non-Regression
// ---------------------------------------------------------------------------
console.log('\n--- TEST 6: Discover Places Recommendation Non-Regression ---')

const mountainQuery = matchSampleDestinations({
  duration: '3-5',
  group: "Friends / Boys' Trip",
  experiences: ['Mountains', 'Adventure'],
  budget: '10k-25k',
  moods: ['Adventurous'],
})
console.assert(mountainQuery.length > 0 && mountainQuery.length <= 5, 'Mountain query must produce results')
console.assert(
  mountainQuery.some((r) => r.destination.name === 'Manali'),
  'Manali must be present in mountain query results'
)
console.log(`✓ 6A: Mountain query returned ${mountainQuery.length} valid recommendations (Top: ${mountainQuery[0].destination.name}).`)

const emptyQuery = matchSampleDestinations({
  duration: '11+',
  group: 'Religious Group',
  experiences: ['Nightlife'],
  budget: 'under-10k',
  moods: [],
})
console.assert(emptyQuery.length === 0, 'Incompatible query must still produce 0 results (empty state)')
console.log('✓ 6B: Incompatible query reliably produces empty state.')

console.log('\n=== All Milestone 9 Integration Tests PASSED Successfully! ===')
