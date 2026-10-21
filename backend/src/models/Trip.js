import mongoose from 'mongoose'

/**
 * Trip Schema
 * Reflects TripSync's trip-creation form and workspace data models:
 * - name: descriptive title of the trip (required, trimmed)
 * - destination: location name (required, trimmed)
 * - startDate: beginning date of trip (required)
 * - endDate: ending date of trip (required, must be >= startDate)
 * - travelers: headcount (required, integer between 1 and 50)
 * - budget: total estimated budget in INR (required, positive number > 0)
 * - notes: optional travel notes / details
 * - timestamps: createdAt and updatedAt managed automatically by Mongoose
 */
const tripSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Trip name is required.'],
      trim: true,
      maxlength: [100, 'Trip name cannot exceed 100 characters.'],
    },
    destination: {
      type: String,
      required: [true, 'Destination is required.'],
      trim: true,
      maxlength: [100, 'Destination cannot exceed 100 characters.'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required.'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required.'],
      validate: {
        validator: function (val) {
          if (!this.startDate || !val) return true
          const start = new Date(this.startDate).getTime()
          const end = new Date(val).getTime()
          return !isNaN(start) && !isNaN(end) && end >= start
        },
        message: 'End date cannot precede start date.',
      },
    },
    travelers: {
      type: Number,
      required: [true, 'Number of travelers is required.'],
      min: [1, 'At least 1 traveler is required.'],
      max: [50, 'Maximum 50 travelers supported.'],
      default: 1,
      validate: {
        validator: Number.isInteger,
        message: 'Number of travelers must be an integer.',
      },
    },
    budget: {
      type: Number,
      required: [true, 'Total estimated budget is required.'],
      min: [0.01, 'Budget must be greater than zero.'],
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Notes cannot exceed 2000 characters.'],
    },
  },
  {
    timestamps: true,
  }
)

export const Trip = mongoose.model('Trip', tripSchema)
export default Trip
