import { useEffect } from 'react'
import { Button } from '../components/Button/Button'
import { PageContainer } from '../components/PageContainer/PageContainer'
import { CompassLogo } from '../components/CompassLogo/CompassLogo'
import { useAuth } from '../context/authContext'
import { useRouter } from '../context/routerContext'
import { useWishlist } from '../context/wishlistContext'
import { useTrips } from '../context/tripContext'
import { getTripStatus, getTripDurationDays } from '../utils/tripUtils'
import './DashboardPage.css'

/**
 * Upgraded User Dashboard — Travel Workspace.
 * Features derived trip metrics, interactive Wishlist count,
 * My Trips empty/populated state, and full-width Discover Places feature card.
 */
export function DashboardPage() {
  const { user, isAuthenticated, logout } = useAuth()
  const { navigate, routeState } = useRouter()
  const { wishlistCount } = useWishlist()
  const { trips, isLoading, apiError, refreshTrips } = useTrips()

  // Route protection: redirect unauthenticated users to /login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: { redirectTo: '/dashboard' },
        replace: true,
      })
    }
  }, [isAuthenticated, navigate])

  if (!isAuthenticated || !user) {
    return null
  }

  // Derive metrics strictly from the available trip data
  const totalTrips = trips.length
  const upcomingTrips = trips.filter(
    (trip) => getTripStatus(trip.startDate, trip.endDate) === 'Upcoming'
  ).length

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleCreateTrip = () => {
    navigate('/trips/new')
  }

  const handleOpenWishlist = () => {
    navigate('/wishlist')
  }

  const handleExploreDestinations = () => {
    navigate('/discover')
  }

  const userInitial = user.name ? user.name.charAt(0) : 'T'

  return (
    <div className="ts-dashboard-wrapper">
      {/* ------------------------------------------------------------------
          Dashboard Header
          ------------------------------------------------------------------ */}
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
              aria-label="TripSync Dashboard Home"
            >
              <CompassLogo size={26} />
              <span className="ts-brand__name">TripSync</span>
            </a>

            <div className="ts-dashboard-header__actions">
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateTrip}
              >
                + Create New Trip
              </Button>

              <div className="ts-user-profile">
                <div className="ts-user-avatar" title={user.email}>
                  {userInitial}
                </div>
                <span className="ts-user-name">{user.name}</span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleLogout}
                >
                  Log Out
                </Button>
              </div>
            </div>
          </div>
        </PageContainer>
      </header>

      {/* ------------------------------------------------------------------
          Main Workspace Content
          ------------------------------------------------------------------ */}
      <main className="ts-dashboard-main">
        <PageContainer>
          {/* Intent Banner preserved if user arrived from "Plan Your Trip" */}
          {routeState?.action === 'create-trip' && (
            <div className="ts-intent-banner" role="status">
              <div className="ts-intent-banner__content">
                <span>✈️</span>
                <span>
                  <strong>Planning Intent Preserved:</strong> You started from &quot;Plan
                  Your Trip&quot;. Ready to start your itinerary!
                </span>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateTrip}
              >
                Begin Setup
              </Button>
            </div>
          )}

          {/* Backend API Error Banner */}
          {apiError && (
            <div
              className="ts-general-error"
              role="alert"
              style={{ marginBottom: 'var(--space-4)' }}
            >
              <span>{apiError}</span>
              <button
                type="button"
                onClick={refreshTrips}
                style={{
                  marginLeft: 'var(--space-3)',
                  textDecoration: 'underline',
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Welcome Section */}
          <div className="ts-dashboard-welcome-row">
            <div className="ts-welcome-header">
              <h1 className="ts-welcome-title">
                Welcome back, {user.name}
              </h1>
              <p className="ts-welcome-subtitle">
                Your journeys, in one place.
              </p>
            </div>
          </div>

          {/* ----------------------------------------------------------------
              Trip Overview Metrics (Total Trips, Upcoming Trips, Wishlist)
              ---------------------------------------------------------------- */}
          <section className="ts-metrics-section" aria-label="Trip Metrics Overview">
            <div className="ts-metrics-grid">
              {/* Metric 1: Total Trips */}
              <div className="ts-metric-card">
                <span className="ts-metric-label">Total Trips</span>
                <span className="ts-metric-value">{totalTrips}</span>
                <span className="ts-metric-caption">All active and planned journeys</span>
              </div>

              {/* Metric 2: Upcoming Trips */}
              <div className="ts-metric-card">
                <span className="ts-metric-label">Upcoming Trips</span>
                <span className="ts-metric-value">{upcomingTrips}</span>
                <span className="ts-metric-caption">Scheduled departures on your calendar</span>
              </div>

              {/* Metric 3: Wishlist (Clickable, opens wishlist management) */}
              <div
                className="ts-metric-card ts-metric-card--clickable"
                onClick={handleOpenWishlist}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleOpenWishlist()
                  }
                }}
                aria-label={`Wishlist: ${wishlistCount} saved destinations. Click to manage wishlist.`}
              >
                <div className="ts-metric-card__header">
                  <span className="ts-metric-label">Wishlist</span>
                  <span className="ts-metric-link-hint">Manage →</span>
                </div>
                <span className="ts-metric-value">{wishlistCount}</span>
                <span className="ts-metric-caption">
                  Saved dream destinations • Click to view
                </span>
              </div>
            </div>
          </section>

          {/* ----------------------------------------------------------------
              My Trips Section
              ---------------------------------------------------------------- */}
          <section className="ts-trips-section" aria-labelledby="my-trips-heading">
            <div className="ts-section-header-row">
              <h2 id="my-trips-heading" className="ts-section-title">
                My Trips
              </h2>
              {trips.length > 0 && (
                <button
                  type="button"
                  className="ts-view-all-btn"
                  onClick={() => {}}
                >
                  View All ({trips.length})
                </button>
              )}
            </div>

            {/* When loading initial trips: Thoughtful Loading State */}
            {isLoading && trips.length === 0 ? (
              <div className="ts-trips-empty-card">
                <h3 className="ts-empty-card-title">Loading journeys...</h3>
                <p className="ts-empty-card-desc">
                  Fetching your trips from the server.
                </p>
              </div>
            ) : trips.length === 0 ? (
              <div className="ts-trips-empty-card">
                <div className="ts-empty-icon-box">
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
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </div>
                <h3 className="ts-empty-card-title">No trips planned yet</h3>
                <p className="ts-empty-card-desc">
                  Your upcoming journeys and itineraries will appear here once created.
                  Start by setting your destination, dates, and budget targets.
                </p>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleCreateTrip}
                >
                  Create Your First Trip
                </Button>
              </div>
            ) : (
              /* When trips are present: Responsive Trips Grid */
              <div className="ts-trips-grid">
                {trips.map((trip) => {
                  const status = getTripStatus(trip.startDate, trip.endDate)
                  const duration = getTripDurationDays(trip.startDate, trip.endDate)
                  const travelersLabel = `${trip.travelers} ${
                    trip.travelers === 1 ? 'traveler' : 'travelers'
                  }`
                  const budgetLabel =
                    trip.budget !== null && trip.budget !== undefined
                      ? `₹${Number(trip.budget).toLocaleString('en-IN')}`
                      : 'Budget unset'

                  return (
                    <article key={trip.id} className="ts-trip-card">
                      <div className="ts-trip-card__header">
                        <div>
                          <h3 className="ts-trip-card__title">{trip.name}</h3>
                          <span className="ts-trip-card__destination">
                            📍 {trip.destination}
                          </span>
                        </div>
                        <span
                          className={`ts-trip-card__status is-${status.toLowerCase()}`}
                        >
                          {status}
                        </span>
                      </div>

                      <div className="ts-trip-card__details">
                        <span>
                          🗓️ {trip.startDate} to {trip.endDate} ({duration}{' '}
                          {duration === 1 ? 'day' : 'days'})
                        </span>
                        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginTop: '2px' }}>
                          <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary)' }}>
                            👥 {travelersLabel}
                          </span>
                        </div>
                      </div>

                      <div className="ts-trip-card__footer">
                        <span className="ts-trip-card__budget">
                          💰 {budgetLabel}
                        </span>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/trips/${trip.id}`)}
                        >
                          Open Workspace →
                        </Button>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>

          {/* ----------------------------------------------------------------
              Plan Your Next Adventure Section — Full-Width Discover Places Card
              ---------------------------------------------------------------- */}
          <section className="ts-adventure-section" aria-labelledby="adventure-heading">
            <div className="ts-section-header-row">
              <h2 id="adventure-heading" className="ts-section-title">
                Plan Your Next Adventure
              </h2>
            </div>

            <article className="ts-discover-banner">
              <div className="ts-discover-banner__main">
                <div className="ts-discover-banner__icon-box">
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                  </svg>
                </div>

                <div className="ts-discover-banner__content">
                  <div className="ts-discover-banner__tag-row">
                    <span className="ts-discover-tag">Discovery Engine</span>
                  </div>

                  <h3 className="ts-discover-banner__title">Discover Places</h3>

                  <p className="ts-discover-banner__desc">
                    Find destinations thoughtfully matched to your travel interests, trip
                    budget, preferred duration, and pace. Bookmark inspiring locations directly
                    into your wishlist or turn them into day-by-day itineraries.
                  </p>

                  <div className="ts-discover-banner__criteria">
                    <span className="ts-criteria-pill">🎯 Travel Interests</span>
                    <span className="ts-criteria-pill">💰 Budget Ranges</span>
                    <span className="ts-criteria-pill">⏳ Trip Durations</span>
                    <span className="ts-criteria-pill">🌿 Preferred Travel Styles</span>
                  </div>
                </div>
              </div>

              <div className="ts-discover-banner__actions">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleExploreDestinations}
                >
                  Explore Destinations
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleOpenWishlist}
                >
                  View Wishlist ({wishlistCount})
                </Button>
              </div>
            </article>
          </section>
        </PageContainer>
      </main>

      {/* ------------------------------------------------------------------
          Dashboard Footer
          ------------------------------------------------------------------ */}
      <footer className="ts-dashboard-footer">
        <PageContainer>
          <span>TripSync Travel Workspace • React + Vite</span>
        </PageContainer>
      </footer>
    </div>
  )
}

export default DashboardPage
