import { Router } from 'express'
import { getDatabaseStatus } from '../config/db.js'

const router = Router()

/**
 * GET /api/health
 * Public health-check endpoint to verify Express server and database status.
 * Differentiates between backend process health and MongoDB connectivity.
 */
router.get('/health', (req, res) => {
  const dbStatus = getDatabaseStatus()

  res.status(200).json({
    status: 'ok',
    message: 'TripSync backend is running',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    database: dbStatus,
  })
})

export default router
