import { Router } from 'express'
import {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip,
} from '../controllers/tripController.js'
import expenseRoutes from './expenseRoutes.js'
import { getBudgetSummary } from '../controllers/expenseController.js'

const router = Router()

/**
 * Trip REST Endpoints
 * Base path mounted at: /api/trips
 *
 * Current Milestone 12 Notice:
 * These endpoints are currently unauthenticated development routes.
 * User ownership and auth protection will be integrated in a later milestone.
 */

// POST /api/trips — Create a new trip
router.post('/', createTrip)

// GET /api/trips — List trips
router.get('/', getTrips)

// GET /api/trips/:id — Retrieve a single trip by ID
router.get('/:id', getTripById)

// PATCH /api/trips/:id — Update permitted trip fields
router.patch('/:id', updateTrip)

// DELETE /api/trips/:id — Delete a trip by ID
router.delete('/:id', deleteTrip)

// Sub-resource routes: /api/trips/:tripId/expenses
router.use('/:tripId/expenses', expenseRoutes)

// Convenient direct endpoint: /api/trips/:tripId/budget-summary
router.get('/:tripId/budget-summary', getBudgetSummary)

export default router
