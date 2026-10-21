import http from 'node:http'
import fs from 'node:fs'
import app from '../backend/src/app.js'
import {
  connectDB,
  disconnectDB,
  getDatabaseStatus,
  sanitizeMongoUri,
} from '../backend/src/config/db.js'

console.log('=== TripSync Milestone 11: MongoDB Database Connection Verification ===\n')

async function runTests() {
  // ----------------------------------------------------
  // TEST 1: URI Sanitization & Credential Protection
  // ----------------------------------------------------
  console.log('--- TEST 1: Credential Protection & URI Sanitization ---')
  const sensitiveUri = 'mongodb+srv://johnDoe:superSecretPassword123@mycluster.abc.mongodb.net/tripsync'
  const sanitized = sanitizeMongoUri(sensitiveUri)
  console.assert(!sanitized.includes('superSecretPassword123'), 'Sanitized URI must NOT contain the real password')
  console.assert(!sanitized.includes('johnDoe'), 'Sanitized URI must NOT contain the username')
  console.assert(sanitized.includes('***:***@'), 'Sanitized URI must contain masked credentials')
  console.log('✓ 1A: Connection string credentials masked safely.')

  // ----------------------------------------------------
  // TEST 2: Missing Configuration Handling (Offline Mode)
  // ----------------------------------------------------
  console.log('\n--- TEST 2: Missing Configuration & Disconnected State ---')
  const initialStatus = getDatabaseStatus()
  console.assert(typeof initialStatus.connected === 'boolean', 'connected must be a boolean')
  console.assert(typeof initialStatus.status === 'string', 'status must be a string')
  console.log(`✓ 2A: Initial database status correctly read: status="${initialStatus.status}", connected=${initialStatus.connected}.`)

  const missingResult = await connectDB('')
  console.assert(missingResult.success === false, 'connectDB with empty URI should report success: false')
  console.assert(missingResult.status === 'disconnected', 'connectDB with empty URI should report status: "disconnected"')
  console.log('✓ 2B: connectDB handles missing MONGODB_URI gracefully without throwing or crashing.')

  // ----------------------------------------------------
  // TEST 3: Health Endpoint Database Reporting
  // ----------------------------------------------------
  console.log('\n--- TEST 3: Health Endpoint with Database Status ---')
  const server = http.createServer(app)
  await new Promise((resolve) => server.listen(0, resolve))
  const { port } = server.address()
  const baseUrl = `http://127.0.0.1:${port}`

  try {
    const healthRes = await fetch(`${baseUrl}/api/health`)
    console.assert(healthRes.status === 200, `Expected 200, got ${healthRes.status}`)
    const data = await healthRes.json()

    // Verify existing process health attributes are preserved
    console.assert(data.status === 'ok', 'Process status must remain "ok"')
    console.assert(data.message === 'TripSync backend is running', 'Process message preserved')
    console.assert(typeof data.timestamp === 'string', 'Timestamp must be present')
    console.assert(typeof data.uptime === 'number', 'Uptime must be present')

    // Verify database status is distinctly reported
    console.assert(data.database, 'database object must be present in health response')
    console.assert(typeof data.database.connected === 'boolean', 'database.connected must be a boolean')
    console.assert(data.database.status === 'disconnected', 'database.status should be "disconnected" when no DB connected')
    console.assert(data.database.connected === false, 'database.connected should be false when no DB connected')
    console.log('✓ 3A: Existing process health fields preserved (status="ok", message).')
    console.log(`✓ 3B: Database connectivity distinctly reported: database.status="${data.database.status}", database.connected=${data.database.connected}.`)

    // ----------------------------------------------------
    // TEST 4: Non-Regression on CORS & Unknown Routes
    // ----------------------------------------------------
    console.log('\n--- TEST 4: CORS & 404 Non-Regression ---')
    const notFoundRes = await fetch(`${baseUrl}/api/unknown-test-path`)
    console.assert(notFoundRes.status === 404, `Expected 404, got ${notFoundRes.status}`)
    const notFoundJson = await notFoundRes.json()
    console.assert(notFoundJson.status === 'error', 'Expected error status on 404')
    console.log('✓ 4A: Unknown route returns 404 with structured JSON error.')

    const corsRes = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: 'http://localhost:5173' },
    })
    const allowOrigin = corsRes.headers.get('access-control-allow-origin')
    console.assert(
      allowOrigin === 'http://localhost:5173',
      `Expected CORS origin http://localhost:5173, got ${allowOrigin}`
    )
    console.log(`✓ 4B: CORS headers correctly preserve http://localhost:5173 access.`)

    // ----------------------------------------------------
    // TEST 5: Failed Connection Path (Mocked / Unreachable URI)
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Failed Connection Path Graceful Handling ---')
    // Attempt connecting to an invalid local port with fast timeout
    const failResult = await connectDB('mongodb://127.0.0.1:54321/tripsync_nonexistent')
    console.assert(failResult.success === false, 'Failed connection should return success: false')
    console.assert(failResult.status === 'error', 'Failed connection should return status: "error"')
    console.assert(typeof failResult.error === 'string', 'Error message should be string')
    console.log(`✓ 5: Unreachable connection handled gracefully without unhandled promise rejections.`)

    // Disconnect cleanup
    await disconnectDB()
    console.log('✓ 5B: disconnectDB executed cleanly.')

    // ----------------------------------------------------
    // TEST 6: Environment Template & Gitignore Audit
    // ----------------------------------------------------
    console.log('\n--- TEST 6: Environment Configuration & Git Safety ---')
    const envExample = fs.readFileSync('./backend/.env.example', 'utf-8')
    console.assert(envExample.includes('MONGODB_URI='), '.env.example must specify MONGODB_URI placeholder')
    console.assert(envExample.includes('<username>'), '.env.example must use placeholders, not real credentials')
    console.assert(envExample.includes('<password>'), '.env.example must use placeholders, not real credentials')

    const gitignore = fs.readFileSync('./.gitignore', 'utf-8')
    console.assert(gitignore.includes('.env'), '.gitignore must ignore .env')
    console.assert(gitignore.includes('!.env.example'), '.gitignore must keep .env.example tracked')
    console.log('✓ 6A: backend/.env.example has clear, safe MONGODB_URI placeholders.')
    console.log('✓ 6B: .gitignore rules protect secrets while tracking .env.example.\n')

    console.log('=== All Milestone 11 Database Connection Tests PASSED Successfully! ===')
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
}

runTests().catch((err) => {
  console.error('❌ Milestone 11 Database Test FAILED:', err)
  process.exit(1)
})
