import { createContext, useContext } from 'react'

/**
 * Trip Context for TripSync.
 * Provides access to the user's saved trips and CRUD operations.
 */
export const TripContext = createContext(null)

export function useTrips() {
  const context = useContext(TripContext)
  if (!context) {
    throw new Error('useTrips must be used within a TripProvider')
  }
  return context
}
