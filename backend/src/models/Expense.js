import mongoose from 'mongoose'

/**
 * Standard expense categories matching TripSync frontend (src/utils/tripUtils.js).
 */
export const ALLOWED_CATEGORIES = [
  'Transport',
  'Accommodation',
  'Food',
  'Activities',
  'Shopping',
  'Other',
]

/**
 * Supported payment methods for expense tracking.
 */
export const ALLOWED_PAYMENT_METHODS = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'UPI',
  'Net Banking',
  'Other',
]

/**
 * Expense Schema for Milestone 13B: Budget & Expenses.
 * Represents an expense record tied to a specific trip.
 */
const expenseSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'Trip ID is required.'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Expense title or description is required.'],
      trim: true,
      maxlength: [100, 'Expense title cannot exceed 100 characters.'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters.'],
    },
    amount: {
      type: Number,
      required: [true, 'Expense amount is required.'],
      min: [0.01, 'Expense amount must be greater than zero.'],
    },
    category: {
      type: String,
      required: [true, 'Category is required.'],
      enum: {
        values: ALLOWED_CATEGORIES,
        message: 'Invalid expense category. Allowed categories: Transport, Accommodation, Food, Activities, Shopping, Other.',
      },
      default: 'Other',
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Expense date is required.'],
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ALLOWED_PAYMENT_METHODS,
        message: 'Invalid payment method. Allowed: Cash, Credit Card, Debit Card, UPI, Net Banking, Other.',
      },
      default: 'Cash',
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Notes cannot exceed 1000 characters.'],
    },
  },
  {
    timestamps: true,
  }
)

// Index for querying a trip's expenses in reverse chronological order
expenseSchema.index({ tripId: 1, date: -1 })

const Expense = mongoose.model('Expense', expenseSchema)

export default Expense
