/**
 * Destination API Service for TripSync Milestone 13D.
 * Connects the frontend to the backend Destination REST API endpoints:
 * - GET /api/destinations (list and filter destinations)
 * - GET /api/destinations/:id (retrieve destination by ObjectId or customId)
 * - POST /api/destinations/recommend (generate ranked recommendations from questionnaire criteria)
 */

/**
 * TripSync API Base URL.
 * Uses VITE_API_URL if configured, otherwise defaults to local Express backend on port 5001.
 */
export function getApiBaseUrl() {
  if (
    typeof globalThis !== 'undefined' &&
    globalThis.process &&
    globalThis.process.env &&
    globalThis.process.env.VITE_API_URL
  ) {
    return globalThis.process.env.VITE_API_URL.replace(/\/+$/, '')
  }
  return (
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
    'http://localhost:5001/api'
  ).replace(/\/+$/, '')
}

/**
 * Safely extracts error messages from failed API responses.
 *
 * @param {Response} res
 * @param {Object} data
 * @returns {string}
 */
function extractErrorMessage(res, data) {
  if (data && typeof data === 'object') {
    if (data.message) return data.message
    if (data.error) return typeof data.error === 'string' ? data.error : JSON.stringify(data.error)
  }
  return `Server request failed with status HTTP ${res.status}`
}

/**
 * Normalizes a raw destination object from the backend:
 * - Guarantees `id` matching `customId` or MongoDB `_id`.
 * - Preserves `_id` and `customId`.
 * - Ensures safe array fallbacks for array fields (durations, groups, experiences, etc.).
 * - Preserves all 17 schema fields.
 *
 * @param {Object} rawDest
 * @returns {Object|null}
 */
export function normalizeDestination(rawDest) {
  if (!rawDest || typeof rawDest !== 'object') return null

  const id = rawDest.id || rawDest.customId || (rawDest._id ? String(rawDest._id) : '')
  const customId = rawDest.customId || id
  const _id = rawDest._id ? String(rawDest._id) : customId

  return {
    ...rawDest,
    id,
    customId,
    _id,
    name: typeof rawDest.name === 'string' ? rawDest.name.trim() : '',
    state: typeof rawDest.state === 'string' ? rawDest.state.trim() : '',
    category: typeof rawDest.category === 'string' ? rawDest.category.trim() : '',
    categoryIcon: typeof rawDest.categoryIcon === 'string' ? rawDest.categoryIcon.trim() : '📍',
    durations: Array.isArray(rawDest.durations) ? rawDest.durations : [],
    durationDisplay: typeof rawDest.durationDisplay === 'string' ? rawDest.durationDisplay.trim() : '',
    groups: Array.isArray(rawDest.groups) ? rawDest.groups : [],
    experiences: Array.isArray(rawDest.experiences) ? rawDest.experiences : [],
    budgetRanges: Array.isArray(rawDest.budgetRanges) ? rawDest.budgetRanges : [],
    budgetDisplay: typeof rawDest.budgetDisplay === 'string' ? rawDest.budgetDisplay.trim() : '',
    moods: Array.isArray(rawDest.moods) ? rawDest.moods : [],
    description: typeof rawDest.description === 'string' ? rawDest.description.trim() : '',
    overview: typeof rawDest.overview === 'string' ? rawDest.overview.trim() : '',
    highlights: Array.isArray(rawDest.highlights) ? rawDest.highlights : [],
    bestTime: typeof rawDest.bestTime === 'string' ? rawDest.bestTime.trim() : '',
    isDomestic: rawDest.isDomestic !== undefined ? Boolean(rawDest.isDomestic) : true,
    createdAt: rawDest.createdAt ? new Date(rawDest.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: rawDest.updatedAt ? new Date(rawDest.updatedAt).toISOString() : new Date().toISOString(),
  }
}

/**
 * GET /api/destinations
 * Fetches destinations with optional query parameters and normalizes them.
 *
 * Supported filters:
 * - search: Keyword match against name, state, category, or description
 * - category: Category filter (e.g. 'Mountains', 'Beaches')
 * - state: State or Union Territory filter
 * - duration: Duration tier ('1-2', '3-5', '6-10', '11+')
 * - budget: Budget tier ('under-10k', '10k-25k', '25k-50k', '50k+')
 * - group: Travel group ('Solo', 'Family', etc.)
 * - experience: Experience tag ('Trekking', etc.)
 * - mood: Travel mood tag ('Peaceful', etc.)
 * - domesticOnly: Boolean filter (default: true)
 *
 * @param {Object} [filters={}]
 * @returns {Promise<{ success: boolean, count?: number, destinations?: Array<Object>, error?: string }>}
 */
export async function fetchDestinations(filters = {}) {
  try {
    const params = new URLSearchParams()

    if (filters.search && typeof filters.search === 'string') {
      params.append('search', filters.search.trim())
    }
    if (filters.category && typeof filters.category === 'string') {
      params.append('category', filters.category.trim())
    }
    if (filters.state && typeof filters.state === 'string') {
      params.append('state', filters.state.trim())
    }
    if (filters.duration && typeof filters.duration === 'string') {
      params.append('duration', filters.duration.trim())
    }
    if (filters.budget && typeof filters.budget === 'string') {
      params.append('budget', filters.budget.trim())
    }
    if (filters.group && typeof filters.group === 'string') {
      params.append('group', filters.group.trim())
    }
    if (filters.experience && typeof filters.experience === 'string') {
      params.append('experience', filters.experience.trim())
    }
    if (filters.mood && typeof filters.mood === 'string') {
      params.append('mood', filters.mood.trim())
    }
    if (filters.domesticOnly !== undefined) {
      params.append('domesticOnly', String(Boolean(filters.domesticOnly)))
    }

    const queryString = params.toString()
    const url = `${getApiBaseUrl()}/destinations${queryString ? `?${queryString}` : ''}`

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    const data = await res.json().catch(() => null)

    if (!res.ok) {
      return {
        success: false,
        error: extractErrorMessage(res, data),
      }
    }

    const rawList = Array.isArray(data?.data?.destinations)
      ? data.data.destinations
      : []

    const normalizedDestinations = rawList
      .map(normalizeDestination)
      .filter(Boolean)

    return {
      success: true,
      count: normalizedDestinations.length,
      destinations: normalizedDestinations,
    }
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Failed to connect to backend server to fetch destinations.',
    }
  }
}

/**
 * GET /api/destinations/:id
 * Fetches a single destination by MongoDB ObjectId or customId.
 *
 * @param {string} id
 * @returns {Promise<{ success: boolean, destination?: Object, error?: string }>}
 */
export async function fetchDestinationById(id) {
  try {
    if (!id || typeof id !== 'string' || !id.trim()) {
      return { success: false, error: 'Valid destination ID is required.' }
    }

    const trimmedId = id.trim()
    const res = await fetch(`${getApiBaseUrl()}/destinations/${encodeURIComponent(trimmedId)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    const data = await res.json().catch(() => null)

    if (!res.ok) {
      return {
        success: false,
        error: extractErrorMessage(res, data),
      }
    }

    const rawDest = data?.data?.destination
    if (!rawDest) {
      return {
        success: false,
        error: 'Destination data missing in backend response.',
      }
    }

    return {
      success: true,
      destination: normalizeDestination(rawDest),
    }
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Failed to connect to backend server to fetch destination.',
    }
  }
}

/**
 * POST /api/destinations/recommend
 * Generates ranked destination recommendations based on questionnaire criteria.
 *
 * Preferences payload:
 * - duration: string ('1-2' | '3-5' | '6-10' | '11+')
 * - customDuration: optional number or string (e.g. 4)
 * - group: string (e.g. "Friends / Boys' Trip")
 * - experiences: string[] (at least one required)
 * - budget: string ('under-10k' | '10k-25k' | '25k-50k' | '50k+')
 * - moods: string[] (optional)
 * - domesticOnly: boolean (default: true)
 *
 * @param {Object} preferences
 * @returns {Promise<{ success: boolean, count?: number, recommendations?: Array<Object>, error?: string }>}
 */
export async function recommendDestinations(preferences = {}) {
  try {
    const payload = {
      duration: preferences.duration || '',
      customDuration: preferences.customDuration !== undefined ? preferences.customDuration : null,
      group: preferences.group || '',
      experiences: Array.isArray(preferences.experiences) ? preferences.experiences : [],
      budget: preferences.budget || '',
      moods: Array.isArray(preferences.moods) ? preferences.moods : [],
      domesticOnly: preferences.domesticOnly !== undefined ? Boolean(preferences.domesticOnly) : true,
    }

    const res = await fetch(`${getApiBaseUrl()}/destinations/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json().catch(() => null)

    if (!res.ok) {
      return {
        success: false,
        error: extractErrorMessage(res, data),
      }
    }

    const rawList = Array.isArray(data?.data?.recommendations)
      ? data.data.recommendations
      : []

    const normalizedRecommendations = rawList
      .map((item) => {
        if (!item || typeof item !== 'object') return null
        return {
          ...item,
          destination: normalizeDestination(item.destination),
          score: typeof item.score === 'number' ? item.score : 0,
          isGroupMatch: Boolean(item.isGroupMatch),
          isDurationMatch: Boolean(item.isDurationMatch),
          isBudgetMatch: Boolean(item.isBudgetMatch),
          matchingExperiences: Array.isArray(item.matchingExperiences) ? item.matchingExperiences : [],
          matchingMoods: Array.isArray(item.matchingMoods) ? item.matchingMoods : [],
        }
      })
      .filter((rec) => rec && rec.destination)

    return {
      success: true,
      count: normalizedRecommendations.length,
      recommendations: normalizedRecommendations,
    }
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Failed to connect to backend server for destination recommendations.',
    }
  }
}
