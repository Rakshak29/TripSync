import app from './app.js'
import { connectDB, disconnectDB } from './config/db.js'

const PORT = process.env.PORT || 5001
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'

let server

async function startServer() {
  // Attempt database connection before starting HTTP listener
  await connectDB()

  server = app.listen(PORT, () => {
    console.log(`[TripSync Backend] Server running on http://localhost:${PORT}`)
    console.log(`[TripSync Backend] Health check available at http://localhost:${PORT}/api/health`)
    console.log(`[TripSync Backend] CORS configured for ${CLIENT_ORIGIN}`)
  })
}

// Graceful shutdown handling
async function handleShutdown(signal) {
  console.log(`\n[TripSync Backend] Received ${signal}. Shutting down gracefully...`)
  if (server) {
    server.close(async () => {
      await disconnectDB()
      console.log('[TripSync Backend] Server closed successfully.')
      process.exit(0)
    })
  } else {
    await disconnectDB()
    process.exit(0)
  }
}

process.on('SIGINT', () => handleShutdown('SIGINT'))
process.on('SIGTERM', () => handleShutdown('SIGTERM'))

startServer().catch((err) => {
  console.error('[TripSync Backend] Fatal startup error:', err)
  process.exit(1)
})
