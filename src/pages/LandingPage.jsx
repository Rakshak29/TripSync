import { Button } from '../components/Button/Button'
import { PageContainer } from '../components/PageContainer/PageContainer'
import { CompassLogo } from '../components/CompassLogo/CompassLogo'
import { useRouter } from '../context/routerContext'
import { useAuth } from '../context/authContext'

/**
 * Public Landing Page for TripSync.
 * Directs visitors to explore product benefits, sign in, or plan a trip.
 */
export function LandingPage() {
  const { navigate } = useRouter()
  const { isAuthenticated } = useAuth()

  const handleScrollToTop = (e) => {
    if (e) e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleExploreBenefitsClick = (e) => {
    if (e) e.preventDefault()
    const element = document.getElementById('benefits')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handlePlanTripClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard', { state: { action: 'create-trip' } })
    } else {
      navigate('/login', {
        state: { redirectTo: '/dashboard', action: 'create-trip' },
      })
    }
  }

  const handleSignInClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard')
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="ts-app-wrapper">
      {/* ------------------------------------------------------------------
          Header: Brand on left, Sign In on right only
          ------------------------------------------------------------------ */}
      <header className="ts-header">
        <PageContainer>
          <div className="ts-header__inner">
            <a
              href="#"
              className="ts-brand"
              aria-label="TripSync Home - Return to top"
              onClick={handleScrollToTop}
            >
              <CompassLogo size={28} />
              <span className="ts-brand__name">TripSync</span>
            </a>

            <div className="ts-header__actions">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSignInClick}
              >
                {isAuthenticated ? 'Dashboard' : 'Sign In'}
              </Button>
            </div>
          </div>
        </PageContainer>
      </header>

      {/* ------------------------------------------------------------------
          Main Content
          ------------------------------------------------------------------ */}
      <PageContainer as="main">
        {/* Hero Section: Spacious, Minimal, Visually Balanced */}
        <section className="ts-hero-section">
          <div className="ts-hero-content">
            <h1 className="ts-hero-headline">
              Your next journey, thoughtfully planned
            </h1>

            <p className="ts-hero-supporting">
              TripSync brings destination discovery, day-by-day itineraries,
              to-do checklists, and real-time budget tracking together in one calm workspace.
              Plan with intention, travel without budget surprises.
            </p>

            <div className="ts-hero-cta-group">
              <Button
                variant="primary"
                size="lg"
                onClick={handlePlanTripClick}
              >
                Plan Your Trip
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={handleExploreBenefitsClick}
              >
                Explore Benefits ↓
              </Button>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------
            Product Benefits Section
            ------------------------------------------------------------------ */}
        <section id="benefits" className="ts-benefits-section">
          <div className="ts-section-heading">
            <h2 className="ts-section-heading__title">
              A calmer way to plan every detail of your trip
            </h2>
            <p className="ts-section-heading__subtitle">
              Purpose-built tools to take you from initial inspiration to a day-by-day, budget-conscious itinerary.
            </p>
          </div>

          <div className="ts-benefits-grid">
            {/* Benefit 1: Discover Hidden Gems */}
            <article className="ts-benefit-card">
              <div className="ts-benefit-card__icon-box">
                <svg
                  width="22"
                  height="22"
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
              <h3 className="ts-benefit-card__title">Discover Hidden Gems</h3>
              <p className="ts-benefit-card__body">
                Discover curated destinations and local experiences that match your interests and travel preferences.
              </p>
            </article>

            {/* Benefit 2: Organise Your Itinerary */}
            <article className="ts-benefit-card">
              <div className="ts-benefit-card__icon-box">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <path d="m9 16 2 2 4-4" />
                </svg>
              </div>
              <h3 className="ts-benefit-card__title">Organise Your Itinerary</h3>
              <p className="ts-benefit-card__body">
                Structure your days with flexible pacing, sensible transit times,
                and to-do checklists that keep your travel details in one clear view.
              </p>
            </article>

            {/* Benefit 3: Stay Within Budget */}
            <article className="ts-benefit-card">
              <div className="ts-benefit-card__icon-box">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3 className="ts-benefit-card__title">Stay Within Budget</h3>
              <p className="ts-benefit-card__body">
                Allocate spending across stays, transport, dining, and activities with clear remaining totals
                so you always know where your money goes.
              </p>
            </article>
          </div>
        </section>

        {/* ------------------------------------------------------------------
            Philosophy / Callout Section
            ------------------------------------------------------------------ */}
        <section className="ts-philosophy-section">
          <div className="ts-philosophy-card">
            <h2 className="ts-philosophy-card__title">
              Travel planning, stripped of noise.
            </h2>
            <p className="ts-philosophy-card__text">
              No ad trackers, no affiliate countdowns, and no bloated dashboards.
              Just the essential planning tools you need to build memorable, balanced journeys.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={handlePlanTripClick}
            >
              Plan Your Trip
            </Button>
          </div>
        </section>
      </PageContainer>

      {/* ------------------------------------------------------------------
          Footer
          ------------------------------------------------------------------ */}
      <footer className="ts-footer">
        <PageContainer>
          <div className="ts-footer__inner">
            <div className="ts-footer__brand-col">
              <a
                href="#"
                className="ts-brand"
                onClick={handleScrollToTop}
                aria-label="TripSync Home - Return to top"
              >
                <CompassLogo size={22} />
                <span className="ts-brand__name">TripSync</span>
              </a>
              <p className="ts-footer__tagline">
                Discover better. Plan smarter. Travel within budget.
              </p>
            </div>

            <div className="ts-footer__links">
              <a href="#benefits" onClick={handleExploreBenefitsClick}>
                Explore Benefits
              </a>
              <a href="#" onClick={handleScrollToTop}>
                Back to Top
              </a>
            </div>
          </div>

          <div className="ts-footer__bottom">
            <span>© 2026 TripSync. All rights reserved.</span>
            <span>Minimal travel planning application • Built with React + Vite</span>
          </div>
        </PageContainer>
      </footer>
    </div>
  )
}

export default LandingPage
