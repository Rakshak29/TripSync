import { useState, useEffect } from 'react'
import { Button } from '../components/Button/Button'
import { PageContainer } from '../components/PageContainer/PageContainer'
import { CompassLogo } from '../components/CompassLogo/CompassLogo'
import { useAuth } from '../context/authContext'
import { useRouter } from '../context/routerContext'
import { useWishlist } from '../context/wishlistContext'
import './WishlistPage.css'

/**
 * Functional Wishlist Management Interface.
 * Allows users to add, edit, remove, and view saved dream destinations.
 */
export function WishlistPage() {
  const { user, isAuthenticated, logout } = useAuth()
  const { navigate } = useRouter()
  const { items, addWishlistItem, updateWishlistItem, deleteWishlistItem } =
    useWishlist()

  // Add Form state
  const [destination, setDestination] = useState('')
  const [note, setNote] = useState('')
  const [formError, setFormError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  // Edit state
  const [editingId, setEditingId] = useState(null)
  const [editDestination, setEditDestination] = useState('')
  const [editNote, setEditNote] = useState('')
  const [editError, setEditError] = useState(null)

  // Delete confirmation state
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  // Route protection
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: { redirectTo: '/wishlist' },
        replace: true,
      })
    }
  }, [isAuthenticated, navigate])

  if (!isAuthenticated || !user) {
    return null
  }

  const handleAddSubmit = (e) => {
    e.preventDefault()
    setFormError(null)
    setSuccessMessage(null)

    const result = addWishlistItem(destination, note)
    if (!result.success) {
      setFormError(result.error)
      return
    }

    setDestination('')
    setNote('')
    setSuccessMessage(`"${destination.trim()}" added to your wishlist!`)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const startEditing = (item) => {
    setEditingId(item.id)
    setEditDestination(item.destination)
    setEditNote(item.note || '')
    setEditError(null)
    setConfirmDeleteId(null)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditDestination('')
    setEditNote('')
    setEditError(null)
  }

  const handleUpdateSubmit = (id) => {
    setEditError(null)
    const result = updateWishlistItem(id, editDestination, editNote)
    if (!result.success) {
      setEditError(result.error)
      return
    }
    cancelEditing()
  }

  const userInitial = user.name ? user.name.charAt(0) : 'T'

  return (
    <div className="ts-wishlist-wrapper">
      {/* Header */}
      <header className="ts-dashboard-header">
        <PageContainer>
          <div className="ts-dashboard-header__inner">
            <a
              href="#"
              className="ts-brand"
              onClick={(e) => {
                e.preventDefault()
                navigate('/dashboard')
              }}
              aria-label="TripSync Dashboard"
            >
              <CompassLogo size={26} />
              <span className="ts-brand__name">TripSync</span>
            </a>

            <div className="ts-user-profile">
              <div className="ts-user-avatar" title={user.email}>
                {userInitial}
              </div>
              <span className="ts-user-name">{user.name}</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  logout()
                  navigate('/')
                }}
              >
                Log Out
              </Button>
            </div>
          </div>
        </PageContainer>
      </header>

      {/* Main Content */}
      <main className="ts-wishlist-main">
        <PageContainer>
          {/* Navigation Breadcrumb */}
          <div className="ts-wishlist-nav">
            <button
              type="button"
              className="ts-back-btn"
              onClick={() => navigate('/dashboard')}
            >
              ← Back to Dashboard
            </button>
          </div>

          <div className="ts-wishlist-header">
            <h1 className="ts-wishlist-title">My Travel Wishlist</h1>
            <p className="ts-wishlist-subtitle">
              Collect dream destinations and notes. Convert them into organized
              itineraries whenever you are ready to travel.
            </p>
          </div>

          {/* Add Destination Card */}
          <section
            className="ts-wishlist-form-card"
            aria-labelledby="add-destination-heading"
          >
            <h2 id="add-destination-heading" className="ts-form-card-title">
              Add a Dream Destination
            </h2>
            <p className="ts-form-card-desc">
              Save places like Kerala, Sikkim, Jaipur, or any location you wish
              to visit.
            </p>

            {formError && (
              <div
                className="ts-general-error"
                role="alert"
                style={{ marginBottom: 'var(--space-4)' }}
              >
                {formError}
              </div>
            )}

            {successMessage && (
              <div
                className="ts-intent-banner"
                role="status"
                style={{ marginBottom: 'var(--space-4)' }}
              >
                <span>✓</span>
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="ts-wishlist-form" noValidate>
              <div className="ts-form-row">
                <div className="ts-form-group">
                  <label htmlFor="wishlist-dest" className="ts-label">
                    Destination Name *
                  </label>
                  <input
                    id="wishlist-dest"
                    type="text"
                    placeholder="e.g. Kerala, Sikkim, Jaipur..."
                    value={destination}
                    onChange={(e) => {
                      setDestination(e.target.value)
                      if (formError) setFormError(null)
                    }}
                    className={`ts-wishlist-input ${formError ? 'has-error' : ''}`}
                  />
                </div>

                <div className="ts-form-group">
                  <label htmlFor="wishlist-note" className="ts-label">
                    Personal Note (Optional)
                  </label>
                  <input
                    id="wishlist-note"
                    type="text"
                    placeholder="e.g. Backwaters, tea estates & spice markets..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="ts-wishlist-input"
                  />
                </div>
              </div>

              <div>
                <Button variant="primary" size="md" type="submit">
                  + Add to Wishlist
                </Button>
              </div>
            </form>
          </section>

          {/* Saved Destinations List Section */}
          <section
            className="ts-wishlist-items-section"
            aria-labelledby="saved-destinations-heading"
          >
            <div className="ts-wishlist-section-header">
              <h2 id="saved-destinations-heading" className="ts-wishlist-section-title">
                Saved Destinations
              </h2>
              <span className="ts-wishlist-count-badge">
                {items.length} {items.length === 1 ? 'place' : 'places'}
              </span>
            </div>

            {items.length === 0 ? (
              <div className="ts-wishlist-empty-card">
                <div className="ts-wishlist-empty-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <h3 className="ts-wishlist-empty-title">Your wishlist is empty</h3>
                <p className="ts-wishlist-empty-desc">
                  Start collecting destinations you would love to visit. Use the form
                  above to add your first destination and keep notes on what you want to
                  experience.
                </p>
              </div>
            ) : (
              <div className="ts-wishlist-grid">
                {items.map((item) => {
                  const isEditing = editingId === item.id
                  const isConfirmingDelete = confirmDeleteId === item.id

                  return (
                    <article key={item.id} className="ts-wishlist-card">
                      {isEditing ? (
                        /* Inline Edit Form */
                        <div className="ts-edit-form">
                          {editError && (
                            <div className="ts-general-error" role="alert">
                              {editError}
                            </div>
                          )}

                          <div className="ts-form-group">
                            <label
                              htmlFor={`edit-dest-${item.id}`}
                              className="ts-label"
                            >
                              Destination Name *
                            </label>
                            <input
                              id={`edit-dest-${item.id}`}
                              type="text"
                              value={editDestination}
                              onChange={(e) => setEditDestination(e.target.value)}
                              className={`ts-wishlist-input ${
                                editError ? 'has-error' : ''
                              }`}
                            />
                          </div>

                          <div className="ts-form-group">
                            <label
                              htmlFor={`edit-note-${item.id}`}
                              className="ts-label"
                            >
                              Note (Optional)
                            </label>
                            <input
                              id={`edit-note-${item.id}`}
                              type="text"
                              value={editNote}
                              onChange={(e) => setEditNote(e.target.value)}
                              className="ts-wishlist-input"
                            />
                          </div>

                          <div className="ts-edit-actions">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={cancelEditing}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleUpdateSubmit(item.id)}
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* Normal Card Display */
                        <>
                          <div className="ts-wishlist-card-header">
                            <h3 className="ts-destination-name">
                              <span
                                className="ts-destination-icon"
                                aria-hidden="true"
                              >
                                📍
                              </span>
                              <span>{item.destination}</span>
                            </h3>
                            {item.createdAt && (
                              <span className="ts-destination-date">
                                Added{' '}
                                {new Date(item.createdAt).toLocaleDateString(
                                  undefined,
                                  {
                                    month: 'short',
                                    day: 'numeric',
                                  }
                                )}
                              </span>
                            )}
                          </div>

                          {item.note ? (
                            <p className="ts-destination-note">{item.note}</p>
                          ) : (
                            <p className="ts-destination-note is-empty">
                              No travel note added yet
                            </p>
                          )}

                          {isConfirmingDelete ? (
                            <div className="ts-delete-confirm-box" role="alert">
                              <span className="ts-delete-confirm-text">
                                Remove {item.destination} from wishlist?
                              </span>
                              <div className="ts-delete-confirm-actions">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => setConfirmDeleteId(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => {
                                    deleteWishlistItem(item.id)
                                    setConfirmDeleteId(null)
                                  }}
                                  style={{
                                    backgroundColor: 'var(--color-error)',
                                    borderColor: 'var(--color-error)',
                                  }}
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="ts-wishlist-card-actions">
                              <button
                                type="button"
                                className="ts-card-action-btn"
                                onClick={() => startEditing(item)}
                              >
                                ✎ Edit
                              </button>
                              <button
                                type="button"
                                className="ts-card-action-btn is-delete"
                                onClick={() => setConfirmDeleteId(item.id)}
                              >
                                ✕ Remove
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </article>
                  )
                })}
              </div>
            )}
          </section>

          {/* Prototype Storage Disclosure */}
          <div className="ts-wishlist-storage-notice">
            <strong>Prototype Storage Note:</strong> Your wishlist items are persisted
            in your browser&apos;s local storage for your account ({user.email}). Live
            database persistence with MongoDB will be connected during backend
            integration.
          </div>
        </PageContainer>
      </main>
    </div>
  )
}

export default WishlistPage
