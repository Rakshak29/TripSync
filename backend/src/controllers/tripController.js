import mongoose from 'mongoose'
import Trip from '../models/Trip.js'

// Allowed fields for creation and updates
const PERMITTED_FIELDS = [
  'name',
  'destination',
  'startDate',
  'endDate',
  'travelers',
  'budget',
  'notes',
]

/**
 * Validates whether a given string is a valid 24-character hex MongoDB ObjectId.
 */
function isValidObjectId(id) {
  return (
    typeof id === 'string' &&
    mongoose.Types.ObjectId.isValid(id) &&
    new mongoose.Types.ObjectId(id).toString() === id
  )
}

/**
 * Extracts and formats user-friendly error messages from Mongoose validation errors.
 */
function formatValidationError(err) {
  if (err.name === 'ValidationError' && err.errors) {
    const messages = Object.values(err.errors).map((e) => e.message)
    return messages.join(' ')
  }
  return err.message || 'Validation error'
}

/**
 * POST /api/trips
 * Creates a new trip document.
 */
export async function createTrip(req, res, next) {
  try {
    const body = req.body || {}

    // Extract only permitted fields
    const tripData = {}
    for (const field of PERMITTED_FIELDS) {
      if (body[field] !== undefined) {
        tripData[field] = body[field]
      }
    }

    // Explicit check for required fields before saving
    if (!tripData.name || !String(tripData.name).trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Trip name is required.',
      })
    }
    if (!tripData.destination || !String(tripData.destination).trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Destination is required.',
      })
    }
    if (!tripData.startDate) {
      return res.status(400).json({
        status: 'error',
        message: 'Start date is required.',
      })
    }
    if (!tripData.endDate) {
      return res.status(400).json({
        status: 'error',
        message: 'End date is required.',
      })
    }
    if (
      tripData.budget === undefined ||
      tripData.budget === null ||
      isNaN(Number(tripData.budget)) ||
      Number(tripData.budget) <= 0
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'Total estimated budget is required and must be greater than zero.',
      })
    }
    if (
      tripData.travelers !== undefined &&
      (!Number.isInteger(Number(tripData.travelers)) || Number(tripData.travelers) < 1)
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'Number of travelers must be an integer of at least 1.',
      })
    }

    const trip = new Trip(tripData)
    await trip.save()

    return res.status(201).json({
      status: 'ok',
      message: 'Trip created successfully',
      data: trip,
    })
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        status: 'error',
        message: formatValidationError(err),
      })
    }
    return next(err)
  }
}

/**
 * GET /api/trips
 * Retrieves list of trips with limit and descending createdAt ordering.
 */
export async function getTrips(req, res, next) {
  try {
    const rawLimit = Number(req.query.limit)
    const limit = !isNaN(rawLimit) && rawLimit > 0 && rawLimit <= 100 ? rawLimit : 50

    const trips = await Trip.find().sort({ createdAt: -1 }).limit(limit)

    return res.status(200).json({
      status: 'ok',
      count: trips.length,
      data: trips,
    })
  } catch (err) {
    return next(err)
  }
}

/**
 * GET /api/trips/:id
 * Retrieves a single trip by its MongoDB ObjectId.
 */
export async function getTripById(req, res, next) {
  try {
    const { id } = req.params

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: `Invalid trip ID format: "${id}". Must be a 24-character hexadecimal string.`,
      })
    }

    const trip = await Trip.findById(id)
    if (!trip) {
      return res.status(404).json({
        status: 'error',
        message: `Trip not found with ID: ${id}`,
      })
    }

    return res.status(200).json({
      status: 'ok',
      data: trip,
    })
  } catch (err) {
    return next(err)
  }
}

/**
 * PATCH /api/trips/:id
 * Updates permitted fields on an existing trip document.
 */
export async function updateTrip(req, res, next) {
  try {
    const { id } = req.params

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: `Invalid trip ID format: "${id}". Must be a 24-character hexadecimal string.`,
      })
    }

    const body = req.body || {}

    // Reject disallowed root updates (e.g. attempting to change _id)
    if (body._id !== undefined && body._id !== id) {
      return res.status(400).json({
        status: 'error',
        message: 'Updating the immutable _id field is not permitted.',
      })
    }

    // Filter to only permitted fields
    const updates = {}
    for (const field of PERMITTED_FIELDS) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No valid fields provided for update. Permitted fields: ' + PERMITTED_FIELDS.join(', '),
      })
    }

    const trip = await Trip.findById(id)
    if (!trip) {
      return res.status(404).json({
        status: 'error',
        message: `Trip not found with ID: ${id}`,
      })
    }

    // Validate travelers if present
    if (updates.travelers !== undefined) {
      const t = Number(updates.travelers)
      if (!Number.isInteger(t) || t < 1 || t > 50) {
        return res.status(400).json({
          status: 'error',
          message: 'Number of travelers must be an integer between 1 and 50.',
        })
      }
    }

    // Validate budget if present
    if (updates.budget !== undefined) {
      const b = Number(updates.budget)
      if (isNaN(b) || b <= 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Total estimated budget must be greater than zero.',
        })
      }
    }

    // Apply updates
    Object.assign(trip, updates)

    // Running .save() executes schema validation and pre-validate date ordering hooks
    await trip.save()

    return res.status(200).json({
      status: 'ok',
      message: 'Trip updated successfully',
      data: trip,
    })
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        status: 'error',
        message: formatValidationError(err),
      })
    }
    return next(err)
  }
}

/**
 * DELETE /api/trips/:id
 * Deletes a trip document by its ID.
 */
export async function deleteTrip(req, res, next) {
  try {
    const { id } = req.params

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: `Invalid trip ID format: "${id}". Must be a 24-character hexadecimal string.`,
      })
    }

    const trip = await Trip.findByIdAndDelete(id)
    if (!trip) {
      return res.status(404).json({
        status: 'error',
        message: `Trip not found with ID: ${id}`,
      })
    }

    return res.status(200).json({
      status: 'ok',
      message: 'Trip deleted successfully',
      data: { id: trip._id },
    })
  } catch (err) {
    return next(err)
  }
}
