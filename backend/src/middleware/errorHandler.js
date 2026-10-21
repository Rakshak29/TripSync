/**
 * Middleware to handle unknown / unmatched routes.
 * Returns HTTP 404 with a structured JSON error response.
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    status: 'error',
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  })
}

/**
 * Global error handling middleware for Express.
 * Note: 'next' is required in the signature so Express identifies this as an error-handling middleware.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // Log server-side error for developer visibility
  console.error('[TripSync Backend Error]:', err.stack || err.message || err)

  const statusCode = err.status || err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}
