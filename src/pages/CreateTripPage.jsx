import { useState, useEffect } from 'react'
import { Button } from '../components/Button/Button'
import { PageContainer } from '../components/PageContainer/PageContainer'
import { CompassLogo } from '../components/CompassLogo/CompassLogo'
import { useAuth } from '../context/authContext'
import { useRouter } from '../context/routerContext'
import { useTrips } from '../context/tripContext'
import { getTripDurationDays, formatINR, calculateAverageBudget } from '../utils/tripUtils'
import './CreateTripPage.css'

/**
 * Simplified Trip Creation Workflow (/trips/new).
 * Collects core trip details, companion count, and initial required budget,
 * with a review step before initializing the trip workspace.
 */
export function CreateTripPage() {
  const { user, isAuthenticated, logout } = useAuth()
  const { navigate, routeState } = useRouter()
  const { addTrip } = useTrips()

  // Navigation step: 'form' | 'review'
  const [step, setStep] = useState('form')

  // Form state (prefill destination if routed from Discover Places or external action)
  const initialDestination =
    routeState?.destination ||
    (typeof window !== 'undefined' && window.history?.state?.destination) ||
    ''
  const [name, setName] = useState('')
  const [destination, setDestination] = useState(initialDestination)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [travelers, setTravelers] = useState(2)
  const [budget, setBudget] = useState('')
  const [notes, setNotes] = useState('')

  // Validation & Submission state
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Route protection
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: { redirectTo: '/trips/new' },
        replace: true,
      })
    }
  }, [isAuthenticated, navigate])

  if (!isAuthenticated || !user) {
    return null
  }

  // Concise traveler live label
  const getTravelerLabel = (count) => {
    return count === 1 ? '1 person' : `${count} people`
  }

  // Validate Step 1 form fields
  const validateForm = () => {
    const errs = {}
    if (!name.trim()) {
      errs.name = 'Trip name is required (e.g. Summer Vacation).'
    }
    if (!destination.trim()) {
      errs.destination = 'Destination is required (e.g. Kerala, Sikkim, Manali).'
    }
    if (!startDate) {
      errs.startDate = 'Start date is required.'
    }
    if (!endDate) {
      errs.endDate = 'End date is required.'
    }
    if (startDate && endDate && endDate < startDate) {
      errs.endDate = 'End date cannot precede start date.'
    }
    if (!travelers || travelers < 1) {
      errs.travelers = 'At least 1 traveler is required.'
    } else if (travelers > 50) {
      errs.travelers = 'Maximum 50 travelers supported.'
    }

    // Budget is required and must be a positive number > 0
    const numBudget = Number(budget)
    if (
      budget === '' ||
      budget === null ||
      budget === undefined ||
      isNaN(numBudget) ||
      numBudget <= 0
    ) {
      errs.budget = 'Total estimated budget is required and must be greater than zero.'
    }

    return errs
  }

  const handleProceedToReview = (e) => {
    e.preventDefault()
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})
    setStep('review')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleConfirmCreate = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    setErrors({})

    try {
      const result = await addTrip({
        name,
        destination,
        startDate,
        endDate,
        travelers,
        budget,
        notes,
      })

      if (!result.success || !result.trip) {
        setErrors({ form: result.error || 'Failed to save trip. Please try again.' })
        setIsSubmitting(false)
        return
      }

      // Navigate straight to the new trip's dedicated workspace only after confirmed success
      navigate(`/trips/${result.trip.id}`)
    } catch (err) {
      setErrors({ form: err.message || 'An unexpected error occurred while creating your trip.' })
      setIsSubmitting(false)
    }
  }

  const durationDays =
    startDate && endDate && endDate >= startDate
      ? getTripDurationDays(startDate, endDate)
      : null

  const averagePerTraveler = calculateAverageBudget(budget, travelers)
  const userInitial = user.name ? user.name.charAt(0) : 'T'

  return (
    <div className="ts-create-trip-wrapper">
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

      {/* Main Form Content */}
      <main className="ts-create-trip-main">
        <PageContainer>
          {/* Breadcrumb Navigation */}
          <div className="ts-create-trip-nav">
            <button
              type="button"
              className="ts-back-btn"
              onClick={() => navigate('/dashboard')}
            >
              ← Back to Dashboard
            </button>
          </div>

          <div className="ts-create-trip-header">
            <h1 className="ts-create-trip-title">
              {step === 'form' ? 'Plan a New Journey' : 'Review Your Trip Plan'}
            </h1>
            <p className="ts-create-trip-subtitle">
              {step === 'form'
                ? 'Specify your destination, travel dates, companions, and total budget.'
                : 'Confirm the key details before initializing your trip workspace.'}
            </p>
          </div>

          {/* Step Indicator */}
          <div className="ts-step-indicator" aria-label="Creation Steps">
            <div className={`ts-indicator-step ${step === 'form' ? 'is-active' : ''}`}>
              <span className="ts-indicator-badge">1</span>
              <span>Trip Details</span>
            </div>
            <div className="ts-indicator-divider" />
            <div className={`ts-indicator-step ${step === 'review' ? 'is-active' : ''}`}>
              <span className="ts-indicator-badge">2</span>
              <span>Review &amp; Confirm</span>
            </div>
          </div>

          {errors.form && (
            <div
              className="ts-general-error"
              role="alert"
              style={{ maxWidth: '720px', marginBottom: 'var(--space-4)' }}
            >
              {errors.form}
            </div>
          )}

          {/* STEP 1: FORM INPUTS */}
          {step === 'form' && (
            <form
              onSubmit={handleProceedToReview}
              className="ts-create-trip-card"
              noValidate
            >
              <div>
                <h2 className="ts-form-section-title">Core Trip Information</h2>
                <p className="ts-form-section-desc">
                  Name your journey and specify where you are heading.
                </p>

                <div className="ts-form-grid-2">
                  <div className="ts-form-group">
                    <label htmlFor="trip-name" className="ts-label">
                      Trip Name *
                    </label>
                    <input
                      id="trip-name"
                      type="text"
                      placeholder="e.g. Summer Vacation, Manali Getaway"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value)
                        if (errors.name) setErrors((prev) => ({ ...prev, name: null }))
                      }}
                      className={`ts-input-field ${errors.name ? 'has-error' : ''}`}
                    />
                    {errors.name && (
                      <span className="ts-field-error">{errors.name}</span>
                    )}
                  </div>

                  <div className="ts-form-group">
                    <label htmlFor="trip-destination" className="ts-label">
                      Destination *
                    </label>
                    <input
                      id="trip-destination"
                      type="text"
                      placeholder="e.g. Kerala, Sikkim, Jaipur"
                      value={destination}
                      onChange={(e) => {
                        setDestination(e.target.value)
                        if (errors.destination)
                          setErrors((prev) => ({ ...prev, destination: null }))
                      }}
                      className={`ts-input-field ${
                        errors.destination ? 'has-error' : ''
                      }`}
                    />
                    {errors.destination && (
                      <span className="ts-field-error">{errors.destination}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Travel Dates */}
              <div>
                <h2 className="ts-form-section-title">Dates &amp; Schedule</h2>
                <p className="ts-form-section-desc">
                  Choose your departure and return dates.
                  {durationDays && (
                    <strong style={{ color: 'var(--color-primary)', marginLeft: '6px' }}>
                      ({durationDays} {durationDays === 1 ? 'day' : 'days'})
                    </strong>
                  )}
                </p>

                <div className="ts-form-grid-2">
                  <div className="ts-form-group">
                    <label htmlFor="trip-start-date" className="ts-label">
                      Start Date *
                    </label>
                    <input
                      id="trip-start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value)
                        if (errors.startDate)
                          setErrors((prev) => ({ ...prev, startDate: null }))
                      }}
                      className={`ts-input-field ${
                        errors.startDate ? 'has-error' : ''
                      }`}
                    />
                    {errors.startDate && (
                      <span className="ts-field-error">{errors.startDate}</span>
                    )}
                  </div>

                  <div className="ts-form-group">
                    <label htmlFor="trip-end-date" className="ts-label">
                      End Date *
                    </label>
                    <input
                      id="trip-end-date"
                      type="date"
                      value={endDate}
                      min={startDate || undefined}
                      onChange={(e) => {
                        setEndDate(e.target.value)
                        if (errors.endDate)
                          setErrors((prev) => ({ ...prev, endDate: null }))
                      }}
                      className={`ts-input-field ${
                        errors.endDate ? 'has-error' : ''
                      }`}
                    />
                    {errors.endDate && (
                      <span className="ts-field-error">{errors.endDate}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Number of Travelers */}
              <div className="ts-form-group">
                <label htmlFor="trip-travelers-num" className="ts-label">
                  Number of Travelers *
                </label>
                <div className="ts-travelers-picker">
                  <div className="ts-counter-control">
                    <button
                      type="button"
                      className="ts-counter-btn"
                      disabled={travelers <= 1}
                      onClick={() => setTravelers((prev) => Math.max(1, prev - 1))}
                      aria-label="Decrease traveler count"
                    >
                      −
                    </button>
                    <input
                      id="trip-travelers-num"
                      type="number"
                      min="1"
                      max="50"
                      value={travelers}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10)
                        if (!isNaN(val)) {
                          setTravelers(Math.min(50, Math.max(1, val)))
                          if (errors.travelers)
                            setErrors((prev) => ({ ...prev, travelers: null }))
                        }
                      }}
                      className="ts-counter-input"
                    />
                    <button
                      type="button"
                      className="ts-counter-btn"
                      disabled={travelers >= 50}
                      onClick={() => setTravelers((prev) => Math.min(50, prev + 1))}
                      aria-label="Increase traveler count"
                    >
                      +
                    </button>
                  </div>

                  <span className="ts-travelers-count-text">
                    {getTravelerLabel(travelers)}
                  </span>
                </div>
                {errors.travelers && (
                  <span className="ts-field-error">{errors.travelers}</span>
                )}
              </div>

              {/* Required Total Estimated Budget */}
              <div className="ts-form-group">
                <label htmlFor="trip-budget" className="ts-label">
                  Total Estimated Budget (₹) *
                </label>
                <div className="ts-currency-input-wrap">
                  <span className="ts-currency-symbol">₹</span>
                  <input
                    id="trip-budget"
                    type="number"
                    min="1"
                    step="500"
                    placeholder="e.g. 50000"
                    value={budget}
                    onChange={(e) => {
                      setBudget(e.target.value)
                      if (errors.budget)
                        setErrors((prev) => ({ ...prev, budget: null }))
                    }}
                    className={`ts-input-field with-currency ${
                      errors.budget ? 'has-error' : ''
                    }`}
                  />
                </div>
                <span className="ts-input-helper">
                  Total spending budget for the entire trip (not a per-person amount).
                </span>
                {errors.budget && (
                  <span className="ts-field-error">{errors.budget}</span>
                )}
              </div>

              {/* Additional Notes */}
              <div className="ts-form-group">
                <label htmlFor="trip-notes" className="ts-label">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="trip-notes"
                  rows={3}
                  placeholder="e.g. Hotel preferences, flight details, packing reminders, or specific sights to visit..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="ts-input-field"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="ts-form-actions">
                <Button variant="primary" size="md" type="submit">
                  Review Trip Plan →
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  type="button"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* STEP 2: REVIEW & CONFIRM */}
          {step === 'review' && (
            <div className="ts-create-trip-card">
              <div>
                <h2 className="ts-form-section-title">Review Trip Summary</h2>
                <p className="ts-form-section-desc">
                  Please verify your journey details before creating the workspace.
                </p>
              </div>

              <div className="ts-review-box">
                <div className="ts-review-row">
                  <span className="ts-review-label">Trip Name</span>
                  <span className="ts-review-val is-primary">{name}</span>
                </div>

                <div className="ts-review-row">
                  <span className="ts-review-label">Destination</span>
                  <span className="ts-review-val">📍 {destination}</span>
                </div>

                <div className="ts-review-row">
                  <span className="ts-review-label">Travel Dates</span>
                  <span className="ts-review-val">
                    🗓️ {startDate} to {endDate} ({durationDays}{' '}
                    {durationDays === 1 ? 'day' : 'days'})
                  </span>
                </div>

                <div className="ts-review-row">
                  <span className="ts-review-label">Travelers</span>
                  <span className="ts-review-val">
                    👥 {travelers} {travelers === 1 ? 'traveler' : 'travelers'}
                  </span>
                </div>

                <div className="ts-review-row">
                  <span className="ts-review-label">Total Estimated Budget</span>
                  <span className="ts-review-val is-primary">
                    {formatINR(budget)}
                  </span>
                </div>

                {averagePerTraveler !== null && (
                  <div className="ts-review-row">
                    <span className="ts-review-label">Average per Traveler</span>
                    <span className="ts-review-val" style={{ color: 'var(--color-text-muted)' }}>
                      {formatINR(averagePerTraveler)}{' '}
                      <span style={{ fontSize: '11px', color: 'var(--color-text-subtle)' }}>
                        (average across {travelers}{' '}
                        {travelers === 1 ? 'traveler' : 'travelers'})
                      </span>
                    </span>
                  </div>
                )}

                {notes && (
                  <div className="ts-review-row">
                    <span className="ts-review-label">Notes</span>
                    <span className="ts-review-val" style={{ whiteSpace: 'pre-wrap' }}>
                      {notes}
                    </span>
                  </div>
                )}
              </div>

              <div className="ts-form-actions">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleConfirmCreate}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating Workspace...' : '✓ Confirm & Create Trip'}
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setStep('form')}
                  disabled={isSubmitting}
                >
                  ← Back to Edit
                </Button>
              </div>
            </div>
          )}
        </PageContainer>
      </main>
    </div>
  )
}

export default CreateTripPage
