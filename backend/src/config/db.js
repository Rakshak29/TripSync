import mongoose from 'mongoose'

export { mongoose }

/**
 * Sanitizes a MongoDB connection string by masking user credentials.
 * Ensures passwords and usernames are never printed to terminal or logs.
 */
export function sanitizeMongoUri(uri) {
  if (!uri || typeof uri !== 'string') return ''
  return uri.replace(/(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@/i, '$1***:***@')
}

/**
 * Returns the current database connection state and status.
 * Mongoose readyState mapping:
 *   0 = disconnected
 *   1 = connected
 *   2 = connecting
 *   3 = disconnecting
 */
export function getDatabaseStatus() {
  const state = mongoose.connection.readyState
  const statusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  }

  return {
    status: statusMap[state] || 'disconnected',
    connected: state === 1,
    host: state === 1 ? mongoose.connection.host : null,
  }
}

/**
 * Connects to MongoDB using Mongoose.
 * @param {string} [customUri] Optional custom URI (useful for testing or overrides)
 * @returns {Promise<{success: boolean, status: string, host?: string, error?: string}>}
 */
export async function connectDB(customUri) {
  const uri = customUri || process.env.MONGODB_URI

  if (!uri) {
    console.warn(
      '[TripSync DB] Warning: MONGODB_URI is not set. Starting in offline/disconnected database mode.'
    )
    return {
      success: false,
      status: 'disconnected',
      message: 'MONGODB_URI not configured',
    }
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // 5s timeout to avoid hanging indefinitely if Atlas is unreachable
    })

    console.log(`[TripSync DB] Successfully connected to MongoDB host: ${conn.connection.host}`)
    return {
      success: true,
      status: 'connected',
      host: conn.connection.host,
    }
  } catch (err) {
    const safeUri = sanitizeMongoUri(uri)
    console.error(
      `[TripSync DB Error] Failed to connect to MongoDB (${safeUri}):`,
      err.message
    )
    return {
      success: false,
      status: 'error',
      error: err.message,
    }
  }
}

/**
 * Disconnects cleanly from MongoDB if an active connection exists.
 */
export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
    console.log('[TripSync DB] Closed database connection.')
  }
}
