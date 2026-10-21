import mongoose from 'mongoose'
import Trip from '../models/Trip.js'
import Expense, { ALLOWED_CATEGORIES, ALLOWED_PAYMENT_METHODS } from '../models/Expense.js'

/**
 * Category metadata for rich frontend breakdown matching src/utils/tripUtils.js
 */
const CATEGORY_META = {
  Transport: { icon: '🚆', label: 'Transport' },
  Accommodation: { icon: '🏨', label: 'Accommodation' },
  Food: { icon: '🍽️', label: 'Food & Dining' },
  Activities: { icon: '🎟️', label: 'Activities' },
  Shopping: { icon: '🛍️', label: 'Shopping' },
  Other: { icon: '📦', label: 'Other' },
}

/**
 * Helper to validate a trip ID and verify the trip exists in the database.
 * Returns { trip, errorResponse }
 */
async function verifyTrip(tripId, res) {
  if (!tripId || !mongoose.Types.ObjectId.isValid(tripId)) {
    return {
      errorResponse: res.status(400).json({
        status: 'error',
        message: 'Invalid trip ID format.',
      }),
    }
  }

  const trip = await Trip.findById(tripId)
  if (!trip) {
    return {
      errorResponse: res.status(404).json({
        status: 'error',
        message: `Trip not found with ID: ${tripId}`,
      }),
    }
  }

  return { trip }
}

/**
 * POST /api/trips/:tripId/expenses
 * Create a new expense for a specific trip.
 */
export async function createExpense(req, res, next) {
  try {
    const { tripId } = req.params
    const { trip, errorResponse } = await verifyTrip(tripId, res)
    if (errorResponse) return

    const {
      title,
      description,
      amount,
      category = 'Other',
      date,
      paymentMethod = 'Cash',
      notes = '',
    } = req.body || {}

    // Support title or description as primary description text
    const effectiveTitle = (title || description || '').trim()
    if (!effectiveTitle) {
      return res.status(400).json({
        status: 'error',
        message: 'Expense title or description is required.',
      })
    }

    // Validate amount
    const numAmount = Number(amount)
    if (amount === undefined || amount === null || isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Expense amount is required and must be greater than zero.',
      })
    }

    // Validate category
    if (!ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({
        status: 'error',
        message: `Invalid expense category: "${category}". Allowed categories: ${ALLOWED_CATEGORIES.join(', ')}.`,
      })
    }

    // Validate date
    if (!date) {
      return res.status(400).json({
        status: 'error',
        message: 'Expense date is required.',
      })
    }
    const parsedDate = new Date(date)
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid expense date format. Must be a valid date.',
      })
    }

    // Validate payment method
    if (paymentMethod && !ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({
        status: 'error',
        message: `Invalid payment method: "${paymentMethod}". Allowed: ${ALLOWED_PAYMENT_METHODS.join(', ')}.`,
      })
    }

    const expense = new Expense({
      tripId: trip._id,
      title: effectiveTitle,
      description: (description || effectiveTitle).trim(),
      amount: numAmount,
      category,
      date: parsedDate,
      paymentMethod,
      notes: (notes || '').trim(),
    })

    await expense.save()

    res.status(201).json({
      status: 'success',
      message: 'Expense created successfully',
      data: {
        expense,
      },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/trips/:tripId/expenses
 * List all expenses for a specific trip, with optional category and date filtering.
 */
export async function getExpenses(req, res, next) {
  try {
    const { tripId } = req.params
    const { trip, errorResponse } = await verifyTrip(tripId, res)
    if (errorResponse) return

    const { category, paymentMethod, startDate, endDate } = req.query

    const filter = { tripId: trip._id }

    if (category) {
      filter.category = category.trim()
    }

    if (paymentMethod) {
      filter.paymentMethod = paymentMethod.trim()
    }

    if (startDate || endDate) {
      filter.date = {}
      if (startDate) {
        filter.date.$gte = new Date(startDate)
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate)
      }
    }

    const expenses = await Expense.find(filter).sort({ date: -1, createdAt: -1 })

    res.status(200).json({
      status: 'success',
      count: expenses.length,
      data: {
        expenses,
      },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/trips/:tripId/expenses/:id
 * Retrieve a single expense by ID, strictly enforcing cross-trip isolation.
 */
export async function getExpenseById(req, res, next) {
  try {
    const { tripId, id } = req.params
    const { trip, errorResponse } = await verifyTrip(tripId, res)
    if (errorResponse) return

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid expense ID format.',
      })
    }

    // Must match both expense ID and tripId
    const expense = await Expense.findOne({ _id: id, tripId: trip._id })
    if (!expense) {
      return res.status(404).json({
        status: 'error',
        message: `Expense not found with ID: ${id} for this trip.`,
      })
    }

    res.status(200).json({
      status: 'success',
      data: {
        expense,
      },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * PATCH /api/trips/:tripId/expenses/:id
 * Update an expense for a specific trip.
 */
export async function updateExpense(req, res, next) {
  try {
    const { tripId, id } = req.params
    const { trip, errorResponse } = await verifyTrip(tripId, res)
    if (errorResponse) return

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid expense ID format.',
      })
    }

    const expense = await Expense.findOne({ _id: id, tripId: trip._id })
    if (!expense) {
      return res.status(404).json({
        status: 'error',
        message: `Expense not found with ID: ${id} for this trip.`,
      })
    }

    const updates = req.body || {}

    // Disallow modifying immutable identifiers
    if (updates._id !== undefined || updates.tripId !== undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Modifying immutable fields (_id, tripId) is not allowed.',
      })
    }

    // Validate updated title if provided
    if (updates.title !== undefined) {
      const trimmed = String(updates.title).trim()
      if (!trimmed) {
        return res.status(400).json({
          status: 'error',
          message: 'Expense title cannot be empty.',
        })
      }
      expense.title = trimmed
    }

    if (updates.description !== undefined) {
      expense.description = String(updates.description).trim()
    }

    // Validate updated amount if provided
    if (updates.amount !== undefined) {
      const numAmount = Number(updates.amount)
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Expense amount must be greater than zero.',
        })
      }
      expense.amount = numAmount
    }

    // Validate updated category if provided
    if (updates.category !== undefined) {
      if (!ALLOWED_CATEGORIES.includes(updates.category)) {
        return res.status(400).json({
          status: 'error',
          message: `Invalid expense category: "${updates.category}". Allowed: ${ALLOWED_CATEGORIES.join(', ')}.`,
        })
      }
      expense.category = updates.category
    }

    // Validate updated date if provided
    if (updates.date !== undefined) {
      const parsedDate = new Date(updates.date)
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid expense date format.',
        })
      }
      expense.date = parsedDate
    }

    // Validate updated payment method if provided
    if (updates.paymentMethod !== undefined) {
      if (!ALLOWED_PAYMENT_METHODS.includes(updates.paymentMethod)) {
        return res.status(400).json({
          status: 'error',
          message: `Invalid payment method: "${updates.paymentMethod}". Allowed: ${ALLOWED_PAYMENT_METHODS.join(', ')}.`,
        })
      }
      expense.paymentMethod = updates.paymentMethod
    }

    if (updates.notes !== undefined) {
      expense.notes = String(updates.notes).trim()
    }

    await expense.save()

    res.status(200).json({
      status: 'success',
      message: 'Expense updated successfully',
      data: {
        expense,
      },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * DELETE /api/trips/:tripId/expenses/:id
 * Delete an expense for a specific trip, ensuring cross-trip isolation.
 */
export async function deleteExpense(req, res, next) {
  try {
    const { tripId, id } = req.params
    const { trip, errorResponse } = await verifyTrip(tripId, res)
    if (errorResponse) return

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid expense ID format.',
      })
    }

    const deleted = await Expense.findOneAndDelete({ _id: id, tripId: trip._id })
    if (!deleted) {
      return res.status(404).json({
        status: 'error',
        message: `Expense not found with ID: ${id} for this trip.`,
      })
    }

    res.status(200).json({
      status: 'success',
      message: 'Expense deleted successfully',
      data: {
        id: deleted._id,
      },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/trips/:tripId/budget-summary
 * Computes live budget summary from actual expense records and trip budget.
 * Does not store redundant or stale computed values in the database.
 */
export async function getBudgetSummary(req, res, next) {
  try {
    const { tripId } = req.params
    const { trip, errorResponse } = await verifyTrip(tripId, res)
    if (errorResponse) return

    // Fetch all expenses for this trip
    const expenses = await Expense.find({ tripId: trip._id })

    // Compute metrics
    const totalBudget = Number(trip.budget) || 0
    const totalSpent = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0)
    const remainingBudget = totalBudget - totalSpent
    const percentageUsed = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0
    const isOverBudget = totalSpent > totalBudget
    const overspentAmount = isOverBudget ? totalSpent - totalBudget : 0

    // Compute category breakdown
    const categoryBreakdown = ALLOWED_CATEGORIES.map((catName) => {
      const meta = CATEGORY_META[catName] || { icon: '📦', label: catName }
      const catExpenses = expenses.filter((e) => e.category === catName)
      const catTotal = catExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
      const count = catExpenses.length
      const percentage = totalSpent > 0 ? Math.round((catTotal / totalSpent) * 100) : 0

      return {
        category: catName,
        label: meta.label,
        icon: meta.icon,
        total: catTotal,
        count,
        percentage,
      }
    })

    res.status(200).json({
      status: 'success',
      data: {
        budgetSummary: {
          tripId: trip._id,
          tripName: trip.name,
          totalBudget,
          totalSpent,
          remainingBudget,
          percentageUsed,
          isOverBudget,
          overspentAmount,
          expenseCount: expenses.length,
          categoryBreakdown,
        },
      },
    })
  } catch (err) {
    next(err)
  }
}
