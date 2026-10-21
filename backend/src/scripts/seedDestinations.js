import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { connectDB, mongoose } from '../config/db.js'
import Destination from '../models/Destination.js'
import { SAMPLE_DESTINATIONS } from '../../../src/data/sampleDestinations.js'

// Ensure backend .env is loaded even when run from project root
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

/**
 * Destination Database Seeder
 * Idempotently inserts or updates the 40 curated travel destinations in MongoDB Atlas.
 *
 * Safety rules:
 * - Does NOT drop or modify existing user trips or other collections.
 * - Uses findOneAndUpdate with upsert: true keyed on customId.
 * - Can be safely run multiple times without duplicating entries.
 */
export async function seedDestinations() {
  console.log('=== TripSync: Destination Database Seeder ===\n')

  try {
    // 1. Establish connection to MongoDB Atlas
    await connectDB()

    console.log(`Preparing to seed ${SAMPLE_DESTINATIONS.length} curated destinations...`)

    let insertedCount = 0
    let updatedCount = 0

    // 2. Perform idempotent upsert for each destination
    for (const item of SAMPLE_DESTINATIONS) {
      const destinationData = {
        customId: item.id,
        name: item.name,
        state: item.state,
        category: item.category,
        categoryIcon: item.categoryIcon || '📍',
        durations: item.durations || [],
        durationDisplay: item.durationDisplay || '',
        groups: item.groups || [],
        experiences: item.experiences || [],
        budgetRanges: item.budgetRanges || [],
        budgetDisplay: item.budgetDisplay || '',
        moods: item.moods || [],
        description: item.description,
        overview: item.overview || '',
        highlights: item.highlights || [],
        bestTime: item.bestTime || '',
        isDomestic: true,
      }

      const res = await Destination.updateOne(
        { customId: item.id },
        { $set: destinationData },
        { upsert: true }
      )

      if (res.upsertedCount > 0) {
        insertedCount++
      } else {
        updatedCount++
      }
    }

    const totalCount = await Destination.countDocuments()

    console.log(`✓ Seeding finished successfully:`)
    console.log(`  - Newly inserted: ${insertedCount}`)
    console.log(`  - Existing updated: ${updatedCount}`)
    console.log(`  - Total destinations in database: ${totalCount}\n`)
  } catch (err) {
    console.error('❌ Destination seeding failed:', err.message)
    process.exitCode = 1
  } finally {
    // Gracefully close connection if this was invoked as a CLI script
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect()
      console.log('Database connection closed.')
    }
  }
}

// Execute if run directly from node CLI
if (process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDestinations()
}
