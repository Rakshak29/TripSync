import { Router } from 'express'
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getBudgetSummary,
} from '../controllers/expenseController.js'

// mergeParams: true ensures :tripId from parent router is accessible
const router = Router({ mergeParams: true })

/**
 * Expense REST Endpoints
 * Mounted at: /api/trips/:tripId/expenses
 */

// GET /api/trips/:tripId/expenses — List all expenses for a trip
router.get('/', getExpenses)

// POST /api/trips/:tripId/expenses — Create an expense for a trip
router.post('/', createExpense)

// GET /api/trips/:tripId/expenses/summary — Dynamic budget summary for a trip
router.get('/summary', getBudgetSummary)

// GET /api/trips/:tripId/expenses/:id — Retrieve an expense by ID
router.get('/:id', getExpenseById)

// PATCH /api/trips/:tripId/expenses/:id — Update an expense by ID
router.patch('/:id', updateExpense)

// DELETE /api/trips/:tripId/expenses/:id — Delete an expense by ID
router.delete('/:id', deleteExpense)

export default router
