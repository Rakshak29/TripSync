import mongoose from 'mongoose'
import Destination from '../models/Destination.js'

/**
 * Maps custom numeric travel days to the corresponding questionnaire duration tier.
 * Mirror of client-side mapping in src/data/sampleDestinations.js.
 *
 * @param {number|string} days
 * @returns {'1-2'|'3-5'|'6-10'|'11+'|null}
 */
export function mapDaysToDurationTier(days) {
  const num = parseInt(days, 10)
  if (isNaN(num) || num < 1) return null
  if (num <= 2) return '1-2'
  if (num <= 5) return '3-5'
  if (num <= 10) return '6-10'
  return '11+'
}

/**
 * GET /api/destinations
 * List all destinations with optional search and query filters.
 *
 * Supported query parameters:
 * - search: Keyword match against name, state, category, or description
 * - category: Filter by category (e.g. Mountains, Beaches)
 * - state: Filter by state or Union Territory
 * - duration: Matches if duration tier is in durations array
 * - budget: Matches if budget tier is in budgetRanges array
 * - group: Matches if group is in groups array
 * - experience: Matches if experience is in experiences array
 * - mood: Matches if mood is in moods array
 * - domesticOnly: Boolean filter for domestic destinations (default: true)
 */
export async function getDestinations(req, res, next) {
  try {
    const {
      search,
      category,
      state,
      duration,
      budget,
      group,
      experience,
      mood,
      domesticOnly,
    } = req.query

    const filter = {}

    // Domestic flag filter
    if (domesticOnly === 'true' || domesticOnly === true || domesticOnly === undefined) {
      filter.isDomestic = true
    } else if (domesticOnly === 'false' || domesticOnly === false) {
      // Allow viewing international destinations if ever added
      filter.isDomestic = false
    }

    // Exact or array membership filters
    if (category) {
      filter.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') }
    }

    if (state) {
      filter.state = { $regex: new RegExp(`^${state.trim()}$`, 'i') }
    }

    if (duration) {
      filter.durations = duration.trim()
    }

    if (budget) {
      filter.budgetRanges = budget.trim()
    }

    if (group) {
      filter.groups = group.trim()
    }

    if (experience) {
      filter.experiences = experience.trim()
    }

    if (mood) {
      filter.moods = mood.trim()
    }

    // Keyword search filter (across name, state, category, and description)
    if (search && search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(escaped, 'i')
      filter.$or = [
        { name: regex },
        { state: regex },
        { category: regex },
        { description: regex },
      ]
    }

    const destinations = await Destination.find(filter).sort({ name: 1 })

    res.status(200).json({
      status: 'success',
      results: destinations.length,
      data: {
        destinations,
      },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/destinations/:id
 * Retrieve a single destination by either its MongoDB _id or customId.
 */
export async function getDestinationById(req, res, next) {
  try {
    const { id } = req.params

    if (!id || !String(id).trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Destination ID parameter is required.',
      })
    }

    const trimmedId = id.trim()
    let destination = null

    // 1. Try finding by MongoDB ObjectId if format is valid
    if (mongoose.Types.ObjectId.isValid(trimmedId)) {
      destination = await Destination.findById(trimmedId)
    }

    // 2. If not found or not an ObjectId, lookup by customId (e.g. 'place_manali')
    if (!destination) {
      destination = await Destination.findOne({ customId: trimmedId })
    }

    if (!destination) {
      return res.status(404).json({
        status: 'error',
        message: `Destination not found with id: ${trimmedId}`,
      })
    }

    res.status(200).json({
      status: 'success',
      data: {
        destination,
      },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/destinations/recommend
 * Accepts questionnaire criteria and returns ranked recommendations.
 *
 * Request body:
 * - duration: string ('1-2' | '3-5' | '6-10' | '11+')
 * - customDuration: optional number or string (e.g. 4)
 * - group: string (e.g. "Friends / Boys' Trip")
 * - experiences: string[] (at least one required)
 * - budget: string ('under-10k' | '10k-25k' | '25k-50k' | '50k+')
 * - moods: string[] (optional)
 * - domesticOnly: boolean (optional, default: true)
 */
export async function getRecommendations(req, res, next) {
  try {
    const {
      duration,
      customDuration,
      group,
      experiences,
      budget,
      moods = [],
      domesticOnly = true,
    } = req.body || {}

    // 1. Validate Duration / Custom Duration
    let effectiveDuration = duration
    if (customDuration) {
      effectiveDuration = mapDaysToDurationTier(customDuration)
    }

    const VALID_DURATIONS = ['1-2', '3-5', '6-10', '11+']
    if (!effectiveDuration || !VALID_DURATIONS.includes(effectiveDuration)) {
      return res.status(400).json({
        status: 'error',
        message:
          'Please provide a valid planned trip duration (1-2, 3-5, 6-10, 11+, or exact positive number of days).',
      })
    }

    // 2. Validate Travel Group
    if (!group || !String(group).trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Please select who you are travelling with.',
      })
    }

    // 3. Validate Experiences (multi-select, must be non-empty array)
    if (!Array.isArray(experiences) || experiences.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Please select at least one experience you would like to have.',
      })
    }

    // 4. Validate Budget
    if (!budget || !String(budget).trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Please select your approximate budget per person.',
      })
    }

    // 5. Fetch candidate destinations from database
    const filter = {}
    if (domesticOnly) {
      filter.isDomestic = true
    }

    const candidateDestinations = await Destination.find(filter)

    const selectedMoods = Array.isArray(moods) ? moods : []
    const trimmedGroup = String(group).trim()
    const trimmedBudget = String(budget).trim()

    // 6. Execute Scoring Algorithm (Matching Milestone 8 & Discovery Page)
    const scored = candidateDestinations.map((dest) => {
      let score = 0

      // (a) Travel group match (+4 points)
      const isGroupMatch = Boolean(
        trimmedGroup && Array.isArray(dest.groups) && dest.groups.includes(trimmedGroup)
      )
      if (isGroupMatch) {
        score += 4
      }

      // (b) Duration match (+3 points)
      const isDurationMatch = Boolean(
        effectiveDuration &&
          Array.isArray(dest.durations) &&
          dest.durations.includes(effectiveDuration)
      )
      if (isDurationMatch) {
        score += 3
      }

      // (c) Budget match (+3 points)
      const isBudgetMatch = Boolean(
        trimmedBudget &&
          Array.isArray(dest.budgetRanges) &&
          dest.budgetRanges.includes(trimmedBudget)
      )
      if (isBudgetMatch) {
        score += 3
      }

      // (d) Experience matches (+3 points each)
      const matchingExperiences = Array.isArray(dest.experiences)
        ? dest.experiences.filter((exp) => experiences.includes(exp))
        : []
      score += matchingExperiences.length * 3

      // (e) Travel mood matches (+1 point each)
      const matchingMoods = Array.isArray(dest.moods)
        ? dest.moods.filter((m) => selectedMoods.includes(m))
        : []
      score += matchingMoods.length * 1

      return {
        destination: dest,
        score,
        isGroupMatch,
        isDurationMatch,
        isBudgetMatch,
        matchingExperiences,
        matchingMoods,
      }
    })

    // 7. Apply Qualifying Filter
    // - Must match the travel group (when specified)
    // - Must match at least one selected experience (when specified)
    // - Must match either duration tier or budget range
    // - Minimum score >= 7 ensures relevance
    const qualified = scored.filter((item) => {
      const groupOk = !trimmedGroup || item.isGroupMatch
      const expOk = experiences.length === 0 || item.matchingExperiences.length > 0
      const coreOk = item.isDurationMatch || item.isBudgetMatch

      return item.score >= 7 && groupOk && expOk && coreOk
    })

    // 8. Sort descending by score
    qualified.sort((a, b) => b.score - a.score)

    // 9. Return top 5 ranked recommendations
    const recommendations = qualified.slice(0, 5)

    res.status(200).json({
      status: 'success',
      results: recommendations.length,
      data: {
        recommendations,
      },
    })
  } catch (err) {
    next(err)
  }
}
