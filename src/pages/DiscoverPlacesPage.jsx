import { useState, useEffect } from 'react'
import { Button } from '../components/Button/Button'
import { PageContainer } from '../components/PageContainer/PageContainer'
import { CompassLogo } from '../components/CompassLogo/CompassLogo'
import { useAuth } from '../context/authContext'
import { useRouter } from '../context/routerContext'
import { useWishlist } from '../context/wishlistContext'
import {
  recommendDestinations,
} from '../services/destinationApi'
import {
  mapDaysToDurationTier,
} from '../data/sampleDestinations'
import './DiscoverPlacesPage.css'

// Duration choices
const DURATION_OPTIONS = [
  { id: '1-2', label: '1–2 Days', desc: 'Weekend / Quick escape' },
  { id: '3-5', label: '3–5 Days', desc: 'Short holiday' },
  { id: '6-10', label: '6–10 Days', desc: 'Week+ vacation' },
  { id: '11+', label: '11+ Days', desc: 'Extended journey' },
]

// Travel group choices
const GROUP_OPTIONS = [
  { id: "Friends / Boys' Trip", label: "Friends / Boys' Trip", icon: '👥' },
  { id: 'Family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { id: 'Couple / Honeymoon', label: 'Couple / Honeymoon', icon: '💍' },
  { id: 'Solo', label: 'Solo', icon: '🎒' },
  { id: 'Religious Group', label: 'Religious Group', icon: '🙏' },
]

// Experience choices (Multi-select)
const EXPERIENCE_OPTIONS = [
  { id: 'Mountains', label: 'Mountains', icon: '🏔️' },
  { id: 'Beaches', label: 'Beaches', icon: '🏖️' },
  { id: 'Waterfalls', label: 'Waterfalls', icon: '🌊' },
  { id: 'Trekking', label: 'Trekking', icon: '🥾' },
  { id: 'Nature and Wildlife', label: 'Nature and Wildlife', icon: '🌿' },
  { id: 'Heritage and Culture', label: 'Heritage and Culture', icon: '🏰' },
  { id: 'Religious and Spiritual Places', label: 'Religious & Spiritual Places', icon: '🕊️' },
  { id: 'Adventure', label: 'Adventure', icon: '🧗' },
  { id: 'Nightlife', label: 'Nightlife', icon: '🎶' },
  { id: 'Relaxation', label: 'Relaxation', icon: '🧘' },
]

// Budget choices per person
const BUDGET_OPTIONS = [
  { id: 'under-10k', label: 'Under ₹10,000', desc: 'Pocket-friendly / Budget' },
  { id: '10k-25k', label: '₹10,000 – ₹25,000', desc: 'Moderate / Standard' },
  { id: '25k-50k', label: '₹25,000 – ₹50,000', desc: 'Comfortable / Premium' },
  { id: '50k+', label: '₹50,000+', desc: 'Luxury / Indulgent' },
]

// Travel mood choices (Multi-select)
const MOOD_OPTIONS = [
  { id: 'Peaceful', label: 'Peaceful', icon: '🕊️' },
  { id: 'Adventurous', label: 'Adventurous', icon: '⚡' },
  { id: 'Scenic', label: 'Scenic', icon: '🌄' },
  { id: 'Cultural', label: 'Cultural', icon: '🏛️' },
  { id: 'Spiritual', label: 'Spiritual', icon: '🪔' },
  { id: 'Fun and Social', label: 'Fun & Social', icon: '🎉' },
]

/**
 * Discover Places Page (/discover).
 * Revised Milestone 7: Destination Discovery Questionnaire & Text-First Results.
 */
export function DiscoverPlacesPage() {
  const { user, isAuthenticated, logout } = useAuth()
  const { navigate } = useRouter()

  // View mode: 'questionnaire' | 'results'
  const [viewMode, setViewMode] = useState('questionnaire')

  // Questionnaire form state (preserved when editing preferences)
  const [duration, setDuration] = useState('3-5')
  const [customDays, setCustomDays] = useState('')
  const [useCustomDays, setUseCustomDays] = useState(false)
  const [group, setGroup] = useState("Friends / Boys' Trip")
  const [experiences, setExperiences] = useState(['Mountains', 'Nature and Wildlife'])
  const [budget, setBudget] = useState('10k-25k')
  const [moods, setMoods] = useState(['Scenic', 'Peaceful'])
  const [domesticOnly, setDomesticOnly] = useState(true)

  // Validation error state
  const [validationError, setValidationError] = useState(null)

  // Async request state (Milestone 13D Stage 3)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState(null)

  // Results state
  const [matchedResults, setMatchedResults] = useState([])

  // Modal state
  const [selectedDestination, setSelectedDestination] = useState(null)

  // Wishlist Integration
  const { items: wishlistItems = [], addWishlistItem } = useWishlist()
  const [actionFeedback, setActionFeedback] = useState(null)

  // Clean modal openers and closers (avoids setState in effects)
  const handleOpenDestination = (dest) => {
    setActionFeedback(null)
    setSelectedDestination(dest)
  }

  const handleCloseDestination = () => {
    setActionFeedback(null)
    setSelectedDestination(null)
  }

  // Helper: check if a destination name exists in current user's wishlist
  const isDestinationInWishlist = (destName) => {
    if (!destName || !wishlistItems) return false
    const target = destName.toLowerCase().trim()
    return wishlistItems.some(
      (item) => item.destination.toLowerCase().trim() === target
    )
  }

  // Check if active modal destination is saved
  const isSelectedSaved = Boolean(
    selectedDestination && isDestinationInWishlist(selectedDestination.name)
  )

  // Handler: Save active destination to Wishlist
  const handleSaveToWishlist = () => {
    if (!selectedDestination) return
    if (isSelectedSaved) {
      setActionFeedback({
        type: 'info',
        message: `"${selectedDestination.name}" is already in your wishlist.`,
      })
      return
    }

    const note = `${selectedDestination.category} · ${selectedDestination.state}. ${selectedDestination.description}`
    const res = addWishlistItem(selectedDestination.name, note)
    if (res.success) {
      setActionFeedback({
        type: 'success',
        message: `"${selectedDestination.name}" was added to your wishlist!`,
      })
    } else {
      setActionFeedback({
        type: 'error',
        message: res.error || 'Failed to save to wishlist.',
      })
    }
  }

  // Handler: Navigate to trip creation with prefilled destination
  const handlePlanTrip = () => {
    if (!selectedDestination) return
    const destName = selectedDestination.name
    handleCloseDestination()
    navigate('/trips/new', {
      state: { destination: destName },
    })
  }

  // Route protection
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: { redirectTo: '/discover' },
        replace: true,
      })
    }
  }, [isAuthenticated, navigate])

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedDestination) {
        handleCloseDestination()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedDestination])

  if (!isAuthenticated || !user) {
    return null
  }

  const userInitial = user.name ? user.name.charAt(0) : 'T'

  // Multi-select toggle helper for experiences
  const handleToggleExperience = (expId) => {
    if (validationError) setValidationError(null)
    setExperiences((prev) =>
      prev.includes(expId) ? prev.filter((id) => id !== expId) : [...prev, expId]
    )
  }

  // Multi-select toggle helper for moods
  const handleToggleMood = (moodId) => {
    setMoods((prev) =>
      prev.includes(moodId) ? prev.filter((id) => id !== moodId) : [...prev, moodId]
    )
  }

  // Form Submission
  const handleSubmitPreferences = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (isLoading) return // Prevent duplicate submissions

    setValidationError(null)
    setApiError(null)

    // Validation
    const effectiveDuration = useCustomDays ? mapDaysToDurationTier(customDays) : duration
    if (!effectiveDuration) {
      setValidationError('Please select or specify your planned trip duration.')
      return
    }

    if (!group) {
      setValidationError('Please select who you are travelling with.')
      return
    }

    if (!experiences || experiences.length === 0) {
      setValidationError('Please select at least one experience you would like to have.')
      return
    }

    if (!budget) {
      setValidationError('Please select your approximate budget per person.')
      return
    }

    setIsLoading(true)

    try {
      const res = await recommendDestinations({
        duration: effectiveDuration,
        customDuration: useCustomDays ? Number(customDays) || customDays : null,
        group,
        experiences,
        budget,
        moods,
        domesticOnly,
      })

      if (!res.success) {
        setApiError(res.error || 'Unable to retrieve destination recommendations. Please try again.')
        return
      }

      setMatchedResults(res.recommendations || [])
      setViewMode('results')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setApiError(err.message || 'A network error occurred while finding destinations. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Return to edit preferences without clearing selections
  const handleEditPreferences = () => {
    setApiError(null)
    setViewMode('questionnaire')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Reset all preferences to clean defaults
  const handleResetPreferences = () => {
    if (isLoading) return
    setDuration('3-5')
    setCustomDays('')
    setUseCustomDays(false)
    setGroup('')
    setExperiences([])
    setBudget('')
    setMoods([])
    setDomesticOnly(true)
    setValidationError(null)
    setApiError(null)
  }

  return (
    <div className="ts-discover-wrapper">
      {/* Top Header */}
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
      <main className="ts-discover-main">
        <PageContainer>
          {/* Back Navigation */}
          <div className="ts-discover-nav">
            <button
              type="button"
              className="ts-back-btn"
              onClick={() => navigate('/dashboard')}
              aria-label="Return to Dashboard"
            >
              ← Back to Dashboard
            </button>
          </div>

          {/* PAGE HERO HEADER */}
          <div className="ts-discover-header">
            <div className="ts-discover-header-text">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <h1 className="ts-discover-title">Discover Places</h1>
                <span className="ts-discover-preview-pill">
                  {viewMode === 'questionnaire' ? 'Trip Preferences' : 'Recommendations'}
                </span>
              </div>
              <p className="ts-discover-subtitle">
                {viewMode === 'questionnaire'
                  ? 'Tell us about your trip requirements and preferred travel style to discover tailored destination recommendations.'
                  : 'Here are destination recommendations matching your travel duration, companions, budget, and desired experiences.'}
              </p>
            </div>
          </div>

          {/* VIEW MODE 1: QUESTIONNAIRE */}
          {viewMode === 'questionnaire' && (
            <div className="ts-questionnaire-card">
              <div className="ts-questionnaire-intro-row">
                <h2 className="ts-questionnaire-title">Plan Your Destination Discovery</h2>
                <span className="ts-questionnaire-hint">All fields marked with * are required</span>
              </div>

              {validationError && (
                <div className="ts-general-error" role="alert">
                  ⚠️ {validationError}
                </div>
              )}

              {apiError && (
                <div className="ts-general-error ts-api-error-banner" role="alert">
                  <div className="ts-api-error-content">
                    <span className="ts-api-error-icon">⚠️</span>
                    <span className="ts-api-error-text">{apiError}</span>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    type="button"
                    onClick={handleSubmitPreferences}
                    disabled={isLoading}
                  >
                    🔄 Retry
                  </Button>
                </div>
              )}

              <form onSubmit={handleSubmitPreferences} className="ts-questionnaire-form">
                {/* QUESTION A: TRIP DURATION */}
                <fieldset className="ts-form-section">
                  <legend className="ts-section-legend">
                    <span className="ts-legend-number">A</span>
                    <span className="ts-legend-text">
                      How many days are you planning to travel? *
                    </span>
                  </legend>

                  <div className="ts-options-grid-4">
                    {DURATION_OPTIONS.map((opt) => {
                      const isSelected = !useCustomDays && duration === opt.id
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          className={`ts-choice-card ${isSelected ? 'is-selected' : ''}`}
                          onClick={() => {
                            setUseCustomDays(false)
                            setDuration(opt.id)
                            if (validationError) setValidationError(null)
                          }}
                          aria-pressed={isSelected}
                        >
                          <span className="ts-choice-label">{opt.label}</span>
                          <span className="ts-choice-desc">{opt.desc}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Custom duration option */}
                  <div className="ts-custom-duration-row">
                    <label className="ts-custom-duration-toggle">
                      <input
                        type="checkbox"
                        checked={useCustomDays}
                        onChange={(e) => {
                          setUseCustomDays(e.target.checked)
                          if (validationError) setValidationError(null)
                        }}
                      />
                      <span>Or enter exact number of days:</span>
                    </label>

                    {useCustomDays && (
                      <div className="ts-custom-days-input-wrap">
                        <input
                          id="custom-days-input"
                          type="number"
                          min="1"
                          max="90"
                          placeholder="e.g. 4"
                          value={customDays}
                          onChange={(e) => {
                            setCustomDays(e.target.value)
                            if (validationError) setValidationError(null)
                          }}
                          className="ts-input-field"
                          style={{ width: '100px' }}
                          autoFocus
                        />
                        <span className="ts-input-helper">days</span>
                      </div>
                    )}
                  </div>
                </fieldset>

                {/* QUESTION B: TRAVEL GROUP */}
                <fieldset className="ts-form-section">
                  <legend className="ts-section-legend">
                    <span className="ts-legend-number">B</span>
                    <span className="ts-legend-text">
                      Who are you travelling with? *
                    </span>
                  </legend>

                  <div className="ts-options-grid-5">
                    {GROUP_OPTIONS.map((grp) => {
                      const isSelected = group === grp.id
                      return (
                        <button
                          key={grp.id}
                          type="button"
                          className={`ts-choice-card is-group ${isSelected ? 'is-selected' : ''}`}
                          onClick={() => {
                            setGroup(grp.id)
                            if (validationError) setValidationError(null)
                          }}
                          aria-pressed={isSelected}
                        >
                          <span className="ts-choice-icon">{grp.icon}</span>
                          <span className="ts-choice-label">{grp.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </fieldset>

                {/* QUESTION C: PREFERRED EXPERIENCES (MULTI-SELECT) */}
                <fieldset className="ts-form-section">
                  <legend className="ts-section-legend">
                    <span className="ts-legend-number">C</span>
                    <div className="ts-legend-col">
                      <span className="ts-legend-text">
                        What would you like to experience? *
                      </span>
                      <span className="ts-legend-subtext">
                        Select one or more experiences that appeal to you
                      </span>
                    </div>
                  </legend>

                  <div className="ts-chips-grid">
                    {EXPERIENCE_OPTIONS.map((exp) => {
                      const isChecked = experiences.includes(exp.id)
                      return (
                        <button
                          key={exp.id}
                          type="button"
                          className={`ts-multi-chip ${isChecked ? 'is-selected' : ''}`}
                          onClick={() => handleToggleExperience(exp.id)}
                          aria-pressed={isChecked}
                        >
                          <span className="ts-chip-icon">{exp.icon}</span>
                          <span className="ts-chip-label">{exp.label}</span>
                          <span className="ts-chip-status" aria-hidden="true">
                            {isChecked ? '✓' : '+'}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </fieldset>

                {/* QUESTION D: BUDGET PER PERSON */}
                <fieldset className="ts-form-section">
                  <legend className="ts-section-legend">
                    <span className="ts-legend-number">D</span>
                    <span className="ts-legend-text">
                      What&apos;s your approximate budget per person? *
                    </span>
                  </legend>

                  <div className="ts-options-grid-4">
                    {BUDGET_OPTIONS.map((b) => {
                      const isSelected = budget === b.id
                      return (
                        <button
                          key={b.id}
                          type="button"
                          className={`ts-choice-card ${isSelected ? 'is-selected' : ''}`}
                          onClick={() => {
                            setBudget(b.id)
                            if (validationError) setValidationError(null)
                          }}
                          aria-pressed={isSelected}
                        >
                          <span className="ts-choice-label">{b.label}</span>
                          <span className="ts-choice-desc">{b.desc}</span>
                        </button>
                      )
                    })}
                  </div>
                </fieldset>

                {/* QUESTION E: TRAVEL MOOD (MULTI-SELECT) */}
                <fieldset className="ts-form-section">
                  <legend className="ts-section-legend">
                    <span className="ts-legend-number">E</span>
                    <div className="ts-legend-col">
                      <span className="ts-legend-text">
                        What kind of trip are you in the mood for?
                      </span>
                      <span className="ts-legend-subtext">
                        Optional · Select all that fit your vibe
                      </span>
                    </div>
                  </legend>

                  <div className="ts-chips-grid">
                    {MOOD_OPTIONS.map((m) => {
                      const isChecked = moods.includes(m.id)
                      return (
                        <button
                          key={m.id}
                          type="button"
                          className={`ts-multi-chip is-mood ${isChecked ? 'is-selected' : ''}`}
                          onClick={() => handleToggleMood(m.id)}
                          aria-pressed={isChecked}
                        >
                          <span className="ts-chip-icon">{m.icon}</span>
                          <span className="ts-chip-label">{m.label}</span>
                          <span className="ts-chip-status" aria-hidden="true">
                            {isChecked ? '✓' : '+'}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </fieldset>

                {/* QUESTION F: OPTIONAL DOMESTIC PREFERENCE */}
                <div className="ts-optional-row">
                  <label className="ts-checkbox-label">
                    <input
                      type="checkbox"
                      checked={domesticOnly}
                      onChange={(e) => setDomesticOnly(e.target.checked)}
                      className="ts-todo-checkbox"
                    />
                    <span className="ts-checkbox-text">
                      Focus on destinations within India (default) 🇮🇳
                    </span>
                  </label>
                </div>

                {/* FORM ACTIONS */}
                <div className="ts-form-actions-row">
                  <button
                    type="button"
                    className="ts-clear-btn"
                    onClick={handleResetPreferences}
                    disabled={isLoading}
                  >
                    Reset Preferences
                  </button>
                  <Button variant="primary" size="lg" type="submit" disabled={isLoading}>
                    {isLoading ? 'Finding Destinations...' : 'Find My Destinations →'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* VIEW MODE 2: RESULTS SECTION */}
          {viewMode === 'results' && (
            <div className="ts-results-container">
              {/* Results Control Header */}
              <div className="ts-results-header-card">
                <div className="ts-results-header-info">
                  <div className="ts-results-title-row">
                    <h2 className="ts-results-title">Destinations for Your Trip</h2>
                    <span className="ts-results-count-badge">
                      {matchedResults.length} {matchedResults.length === 1 ? 'Destination' : 'Destinations'} Found
                    </span>
                  </div>

                  {/* Summary of Active Filter Selections */}
                  <div className="ts-criteria-summary">
                    <span className="ts-criteria-tag">
                      ⏱️ {useCustomDays ? `${customDays} days` : DURATION_OPTIONS.find((d) => d.id === duration)?.label}
                    </span>
                    <span className="ts-criteria-tag">
                      👥 {group}
                    </span>
                    <span className="ts-criteria-tag">
                      💰 {BUDGET_OPTIONS.find((b) => b.id === budget)?.label}
                    </span>
                    {experiences.slice(0, 3).map((exp) => (
                      <span key={exp} className="ts-criteria-tag is-exp">
                        ✦ {exp}
                      </span>
                    ))}
                    {experiences.length > 3 && (
                      <span className="ts-criteria-tag is-exp">
                        +{experiences.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="ts-results-actions">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleEditPreferences}
                  >
                    ✎ Edit Preferences
                  </Button>
                </div>
              </div>

              {/* NO MATCH EMPTY STATE */}
              {matchedResults.length === 0 ? (
                <div className="ts-itinerary-empty-card" style={{ padding: 'var(--space-12) var(--space-8)' }}>
                  <div className="ts-itinerary-empty-icon">🧭</div>
                  <h3 className="ts-itinerary-empty-title">No matching destinations found</h3>
                  <p className="ts-itinerary-empty-desc">
                    We couldn&apos;t find any destinations matching your exact duration, budget, and experience combination. Try broadening your budget range or selecting additional experiences.
                  </p>
                  <Button variant="primary" size="md" onClick={handleEditPreferences}>
                    ✎ Adjust Preferences
                  </Button>
                </div>
              ) : (
                /* TEXT-FIRST DESTINATION CARDS GRID (NO IMAGE BANNERS) */
                <div className="ts-text-cards-grid" role="list">
                  {matchedResults.map(({ destination: dest, score, matchingExperiences = [] }) => (
                    <article key={dest.id} className="ts-text-dest-card" role="listitem">
                      {/* Card Header */}
                      <div className="ts-text-card-header">
                        <div className="ts-text-card-top-meta">
                          <span className="ts-category-pill-tag">
                            {dest.categoryIcon} {dest.category}
                          </span>
                          <div className="ts-text-card-meta-right">
                            {typeof score === 'number' && score > 0 && (
                              <span className="ts-score-badge" title={`Match Score: ${score} points`}>
                                ★ {score} pts
                              </span>
                            )}
                            {isDestinationInWishlist(dest.name) && (
                              <span className="ts-card-saved-pill" title="Saved in your wishlist">
                                ♥ In Wishlist
                              </span>
                            )}
                            <span className="ts-card-location-text">
                              📍 {dest.state}
                            </span>
                          </div>
                        </div>

                        <h3 className="ts-text-card-title">{dest.name}</h3>
                      </div>

                      {/* Card Description */}
                      <p className="ts-text-card-desc">{dest.description}</p>

                      {/* Card Specifications */}
                      <div className="ts-text-card-specs">
                        <div className="ts-spec-item">
                          <span className="ts-spec-label">Duration</span>
                          <span className="ts-spec-value">⏱️ {dest.durationDisplay}</span>
                        </div>
                        <div className="ts-spec-item">
                          <span className="ts-spec-label">Approx. Budget</span>
                          <span className="ts-spec-value">💰 {dest.budgetDisplay}</span>
                        </div>
                      </div>

                      {/* Matching Experience Pills */}
                      <div className="ts-text-card-experiences">
                        <span className="ts-exp-label">Highlights:</span>
                        <div className="ts-exp-pills-row">
                          {dest.experiences.map((exp) => {
                            const isMatch = matchingExperiences.includes(exp)
                            return (
                              <span
                                key={exp}
                                className={`ts-experience-pill ${isMatch ? 'is-match' : ''}`}
                              >
                                {isMatch ? '✓ ' : ''}{exp}
                              </span>
                            )
                          })}
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="ts-text-card-footer">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleOpenDestination(dest)}
                        >
                          View Details →
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </PageContainer>
      </main>

      {/* TEXT-FIRST DESTINATION DETAILS MODAL */}
      {selectedDestination && (
        <div
          className="ts-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dest-modal-title"
          onClick={handleCloseDestination}
        >
          <div
            className="ts-modal-box ts-text-destination-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="ts-modal-header-row">
              <div>
                <span className="ts-destination-modal-badge">
                  {selectedDestination.categoryIcon} {selectedDestination.category}
                </span>
                <h2 id="dest-modal-title" className="ts-destination-modal-title">
                  {selectedDestination.name}
                </h2>
                <span className="ts-destination-modal-location">
                  📍 {selectedDestination.state}, India
                </span>
              </div>
              <button
                type="button"
                className="ts-modal-close-btn"
                onClick={handleCloseDestination}
                aria-label="Close details"
              >
                ✕
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="ts-destination-modal-content">
              {/* Overview */}
              <div className="ts-modal-section">
                <h3 className="ts-modal-section-heading">Overview</h3>
                <p className="ts-modal-section-text">
                  {selectedDestination.overview}
                </p>
              </div>

              {/* Notable Highlights */}
              <div className="ts-modal-section">
                <h3 className="ts-modal-section-heading">Notable Highlights &amp; Attractions</h3>
                <ul className="ts-modal-highlights-list">
                  {selectedDestination.highlights.map((item, idx) => (
                    <li key={idx} className="ts-modal-highlight-item">
                      <span className="ts-highlight-bullet">✦</span> {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Practical Logistics Info */}
              <div className="ts-modal-section">
                <h3 className="ts-modal-section-heading">Trip Planning Information</h3>
                <div className="ts-modal-info-grid">
                  <div className="ts-modal-info-item">
                    <span className="ts-info-label">Recommended Duration</span>
                    <span className="ts-info-val">⏱️ {selectedDestination.durationDisplay}</span>
                  </div>
                  <div className="ts-modal-info-item">
                    <span className="ts-info-label">Estimated Budget</span>
                    <span className="ts-info-val">💰 {selectedDestination.budgetDisplay}</span>
                  </div>
                  <div className="ts-modal-info-item">
                    <span className="ts-info-label">Best Season to Visit</span>
                    <span className="ts-info-val">🗓️ {selectedDestination.bestTime}</span>
                  </div>
                  <div className="ts-modal-info-item">
                    <span className="ts-info-label">Ideal For</span>
                    <span className="ts-info-val">👥 {selectedDestination.groups.slice(0, 2).join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Wishlist Status / Action Feedback Banner */}
              {actionFeedback ? (
                <div
                  className={`ts-action-feedback-banner is-${actionFeedback.type}`}
                  role="status"
                >
                  <span className="ts-feedback-icon">
                    {actionFeedback.type === 'success' ? '✓' : 'ℹ️'}
                  </span>
                  <span className="ts-feedback-text">{actionFeedback.message}</span>
                  {actionFeedback.type === 'success' && (
                    <button
                      type="button"
                      className="ts-feedback-link-btn"
                      onClick={() => {
                        handleCloseDestination()
                        navigate('/wishlist')
                      }}
                    >
                      View Wishlist →
                    </button>
                  )}
                </div>
              ) : isSelectedSaved ? (
                <div className="ts-action-feedback-banner is-saved-notice" role="status">
                  <span className="ts-feedback-icon">✓</span>
                  <span className="ts-feedback-text">
                    This destination is already saved in your wishlist.
                  </span>
                  <button
                    type="button"
                    className="ts-feedback-link-btn"
                    onClick={() => {
                      handleCloseDestination()
                      navigate('/wishlist')
                    }}
                  >
                    View Wishlist →
                  </button>
                </div>
              ) : null}
            </div>

            {/* Modal Actions */}
            <div className="ts-modal-actions ts-destination-modal-actions">
              <Button
                variant="secondary"
                size="md"
                onClick={handleCloseDestination}
              >
                Close
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={handleSaveToWishlist}
                className={isSelectedSaved ? 'ts-btn-saved' : ''}
                title={
                  isSelectedSaved
                    ? `"${selectedDestination.name}" is already in your wishlist`
                    : `Save "${selectedDestination.name}" to your wishlist`
                }
              >
                {isSelectedSaved ? '✓ Saved in Wishlist' : '♡ Save to Wishlist'}
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handlePlanTrip}
                title={`Create a new trip for "${selectedDestination.name}"`}
              >
                ✈ Plan a Trip
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DiscoverPlacesPage
