import { useState, useCallback } from 'react'
import { WishlistContext } from './wishlistContext'
import { useAuth } from './authContext'

function loadStoredWishlist(storageKey) {
  try {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (item) =>
            item &&
            typeof item === 'object' &&
            typeof item.destination === 'string' &&
            Boolean(item.id)
        )
      }
    }
    return []
  } catch {
    return []
  }
}

/**
 * Wishlist Provider for TripSync.
 * Scoped to the authenticated user using browser storage for prototype persistence.
 */
export function WishlistProvider({ children }) {
  const { user } = useAuth()
  const storageKey = user?.email
    ? `tripsync_wishlist_${user.email.toLowerCase()}`
    : 'tripsync_wishlist_guest'

  const [prevStorageKey, setPrevStorageKey] = useState(storageKey)
  const [items, setItems] = useState(() => loadStoredWishlist(storageKey))

  // Adjust state during render if the active user account changes
  if (storageKey !== prevStorageKey) {
    setPrevStorageKey(storageKey)
    setItems(loadStoredWishlist(storageKey))
  }

  // Helper to persist to localStorage
  const saveItems = useCallback(
    (newItems) => {
      setItems(newItems)
      try {
        localStorage.setItem(storageKey, JSON.stringify(newItems))
      } catch {
        // Fallback gracefully if storage quota exceeded or unavailable
      }
    },
    [storageKey]
  )

  /**
   * Add a new destination to the wishlist.
   *
   * @param {string} destination - Name of the place (e.g. "Kerala", "Sikkim")
   * @param {string} [note=''] - Optional travel note
   * @returns {{ success: boolean, error?: string }}
   */
  const addWishlistItem = (destination, note = '') => {
    const trimmedDest = destination.trim()
    const trimmedNote = note.trim()

    if (!trimmedDest) {
      return { success: false, error: 'Destination name cannot be empty.' }
    }

    const isDuplicate = items.some(
      (item) => item.destination.toLowerCase() === trimmedDest.toLowerCase()
    )

    if (isDuplicate) {
      return {
        success: false,
        error: `"${trimmedDest}" is already in your wishlist.`,
      }
    }

    const newItem = {
      id: 'wishlist_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      destination: trimmedDest,
      note: trimmedNote,
      createdAt: new Date().toISOString(),
    }

    const updated = [newItem, ...items]
    saveItems(updated)
    return { success: true }
  }

  /**
   * Update an existing destination in the wishlist.
   *
   * @param {string} id - Unique item ID
   * @param {string} destination - Updated name
   * @param {string} [note=''] - Updated note
   * @returns {{ success: boolean, error?: string }}
   */
  const updateWishlistItem = (id, destination, note = '') => {
    const trimmedDest = destination.trim()
    const trimmedNote = note.trim()

    if (!trimmedDest) {
      return { success: false, error: 'Destination name cannot be empty.' }
    }

    const isDuplicate = items.some(
      (item) =>
        item.id !== id &&
        item.destination.toLowerCase() === trimmedDest.toLowerCase()
    )

    if (isDuplicate) {
      return {
        success: false,
        error: `"${trimmedDest}" is already in your wishlist.`,
      }
    }

    const updated = items.map((item) =>
      item.id === id
        ? {
            ...item,
            destination: trimmedDest,
            note: trimmedNote,
            updatedAt: new Date().toISOString(),
          }
        : item
    )

    saveItems(updated)
    return { success: true }
  }

  /**
   * Remove a destination from the wishlist.
   *
   * @param {string} id - Unique item ID
   */
  const deleteWishlistItem = (id) => {
    const updated = items.filter((item) => item.id !== id)
    saveItems(updated)
  }

  return (
    <WishlistContext.Provider
      value={{
        items,
        wishlistCount: items.length,
        addWishlistItem,
        updateWishlistItem,
        deleteWishlistItem,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export default WishlistProvider
