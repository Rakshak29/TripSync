import mongoose from 'mongoose'

/**
 * Destination Schema for Milestone 13: Discover Destinations.
 * Represents curated travel destinations across India with attributes
 * for duration, travel group, budget, experiences, moods, and highlights.
 */
const destinationSchema = new mongoose.Schema(
  {
    customId: {
      type: String,
      required: [true, 'Unique custom ID is required.'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Destination name is required.'],
      trim: true,
      maxlength: [100, 'Destination name cannot exceed 100 characters.'],
    },
    state: {
      type: String,
      required: [true, 'State or Union Territory is required.'],
      trim: true,
      maxlength: [100, 'State name cannot exceed 100 characters.'],
    },
    category: {
      type: String,
      required: [true, 'Destination category is required.'],
      trim: true,
    },
    categoryIcon: {
      type: String,
      default: '📍',
      trim: true,
    },
    durations: {
      type: [String],
      default: [],
    },
    durationDisplay: {
      type: String,
      trim: true,
      default: '',
    },
    groups: {
      type: [String],
      default: [],
    },
    experiences: {
      type: [String],
      default: [],
    },
    budgetRanges: {
      type: [String],
      default: [],
    },
    budgetDisplay: {
      type: String,
      trim: true,
      default: '',
    },
    moods: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      required: [true, 'Destination description is required.'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters.'],
    },
    overview: {
      type: String,
      trim: true,
      default: '',
    },
    highlights: {
      type: [String],
      default: [],
    },
    bestTime: {
      type: String,
      trim: true,
      default: '',
    },
    isDomestic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// Compound text index on name, state, and category for efficient searching
destinationSchema.index({ name: 'text', state: 'text', category: 'text' })

const Destination = mongoose.model('Destination', destinationSchema)

export default Destination
