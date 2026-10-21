import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import healthRoutes from './routes/healthRoutes.js'
import tripRoutes from './routes/tripRoutes.js'
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js'

// Load environment variables from .env file
dotenv.config()

const app = express()

// Configure CORS for frontend access
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
)

// Body parser for JSON payloads
app.use(express.json())

// API Routes
app.use('/api', healthRoutes)
app.use('/api/trips', tripRoutes)

// 404 handler for unknown routes
app.use(notFoundHandler)

// Central error handler
app.use(errorHandler)

export default app
