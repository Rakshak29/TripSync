import { Router } from 'express'
import {
  getDestinations,
  getDestinationById,
  getRecommendations,
} from '../controllers/destinationController.js'

const router = Router()

/**
 * Destination REST Endpoints
 * Base path mounted at: /api/destinations
 */

// GET /api/destinations — List all destinations with search and query filters
router.get('/', getDestinations)

// POST /api/destinations/recommend — Generate ranked destination recommendations
router.post('/recommend', getRecommendations)

// GET /api/destinations/:id — Retrieve a destination by MongoDB ObjectId or customId
router.get('/:id', getDestinationById)

export default router
