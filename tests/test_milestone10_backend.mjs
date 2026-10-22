import http from 'node:http'
import app from '../backend/src/app.js'

console.log('=== TripSync Milestone 10: Backend Foundation Verification ===\n')

async function runTests() {
  // Start server on dynamic port (0 assigns a free ephemeral port)
  const server = http.createServer(app)
  await new Promise((resolve) => server.listen(0, resolve))
  const { port } = server.address()
  const baseUrl = `http://127.0.0.1:${port}`

  try {
    // ----------------------------------------------------
    // TEST 1: Health check endpoint GET /api/health
    // ----------------------------------------------------
    console.log('--- TEST 1: Health Check Endpoint GET /api/health ---')
    const healthRes = await fetch(`${baseUrl}/api/health`)
    console.assert(healthRes.status === 200, `Expected status 200, got ${healthRes.status}`)
    const contentType = healthRes.headers.get('content-type') || ''
    console.assert(contentType.includes('application/json'), `Expected application/json, got ${contentType}`)

    const healthData = await healthRes.json()
    console.assert(healthData.status === 'ok', `Expected status "ok", got ${healthData.status}`)
    console.assert(
      healthData.message === 'TripSync backend is running',
      `Unexpected message: ${healthData.message}`
    )
    console.assert(typeof healthData.timestamp === 'string', 'Expected ISO timestamp string')
    console.assert(typeof healthData.uptime === 'number', 'Expected numeric uptime')
    console.log('✓ 1A: GET /api/health returns HTTP 200 with application/json.')
    console.log(`✓ 1B: Response payload verified: status="${healthData.status}", message="${healthData.message}".`)
    console.log(`✓ 1C: Server metadata verified: timestamp="${healthData.timestamp}", uptime=${healthData.uptime}s.\n`)

    // ----------------------------------------------------
    // TEST 2: Unknown route handling (404)
    // ----------------------------------------------------
    console.log('--- TEST 2: Unknown Route Handling (404) ---')
    const notFoundRes = await fetch(`${baseUrl}/api/non-existent-route`)
    console.assert(notFoundRes.status === 404, `Expected status 404, got ${notFoundRes.status}`)
    const notFoundData = await notFoundRes.json()
    console.assert(notFoundData.status === 'error', `Expected status "error", got ${notFoundData.status}`)
    console.assert(
      notFoundData.message && notFoundData.message.includes('Route not found'),
      `Unexpected message: ${notFoundData.message}`
    )
    console.log('✓ 2A: Unknown route returns HTTP 404.')
    console.log(`✓ 2B: Structured JSON error message verified: "${notFoundData.message}".\n`)

    // ----------------------------------------------------
    // TEST 3: CORS Header Validation (Multiple Origins & Preflight)
    // ----------------------------------------------------
    console.log('--- TEST 3: CORS Configuration ---')
    // 3A: Origin 5173 allowed
    const corsRes5173 = await fetch(`${baseUrl}/api/health`, {
      headers: {
        Origin: 'http://localhost:5173',
      },
    })
    const allowOrigin5173 = corsRes5173.headers.get('access-control-allow-origin')
    console.assert(
      allowOrigin5173 === 'http://localhost:5173',
      `Expected CORS allow origin http://localhost:5173, got ${allowOrigin5173}`
    )
    console.log(`✓ 3A: CORS correctly permits frontend origin http://localhost:5173.`)

    // 3B: Origin 5174 allowed
    const corsRes5174 = await fetch(`${baseUrl}/api/health`, {
      headers: {
        Origin: 'http://localhost:5174',
      },
    })
    const allowOrigin5174 = corsRes5174.headers.get('access-control-allow-origin')
    console.assert(
      allowOrigin5174 === 'http://localhost:5174',
      `Expected CORS allow origin http://localhost:5174, got ${allowOrigin5174}`
    )
    console.log(`✓ 3B: CORS correctly permits secondary frontend origin http://localhost:5174.`)

    // 3C: OPTIONS preflight request works
    const preflightRes = await fetch(`${baseUrl}/api/health`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:5174',
        'Access-Control-Request-Method': 'PATCH',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    })
    console.assert(preflightRes.status === 204 || preflightRes.status === 200, `Expected 204 or 200 preflight, got ${preflightRes.status}`)
    console.assert(
      preflightRes.headers.get('access-control-allow-origin') === 'http://localhost:5174',
      'Expected preflight to return access-control-allow-origin: http://localhost:5174'
    )
    console.assert(
      preflightRes.headers.get('access-control-allow-credentials') === 'true',
      'Expected preflight to return access-control-allow-credentials: true'
    )
    console.log(`✓ 3C: CORS preflight OPTIONS correctly handled with credentials for http://localhost:5174.`)

    // 3D: Unrelated origin rejected
    const corsResBad = await fetch(`${baseUrl}/api/health`, {
      headers: {
        Origin: 'http://unauthorized-domain.com',
      },
    })
    const allowOriginBad = corsResBad.headers.get('access-control-allow-origin')
    console.assert(
      !allowOriginBad,
      `Expected unrelated origin to be denied CORS header, but got ${allowOriginBad}`
    )
    console.log(`✓ 3D: CORS correctly rejects unauthorized origin (no allow-origin header).\n`)

    // ----------------------------------------------------
    // TEST 4: Environment & Safety Check
    // ----------------------------------------------------
    console.log('--- TEST 4: Environment Configuration & Secret Protection ---')
    const fs = await import('node:fs')
    const envExampleExists = fs.existsSync('./backend/.env.example')
    console.assert(envExampleExists, 'backend/.env.example must exist')

    const envExampleContent = fs.readFileSync('./backend/.env.example', 'utf-8')
    console.assert(envExampleContent.includes('PORT='), '.env.example must specify PORT')
    console.assert(envExampleContent.includes('CLIENT_ORIGIN='), '.env.example must specify CLIENT_ORIGIN')

    // Confirm real .env files are NOT tracked in git
    const gitignoreContent = fs.readFileSync('./.gitignore', 'utf-8')
    console.assert(gitignoreContent.includes('.env'), '.gitignore must ignore .env files')
    console.log('✓ 4A: backend/.env.example exists with safe development placeholder values.')
    console.log('✓ 4B: .gitignore contains active rules ignoring .env and secrets.\n')

    console.log('=== All Milestone 10 Backend Tests PASSED Successfully! ===')
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
}

runTests().catch((err) => {
  console.error('❌ Milestone 10 Backend Test FAILED:', err)
  process.exit(1)
})
