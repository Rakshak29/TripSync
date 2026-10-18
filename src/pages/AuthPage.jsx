import { useState } from 'react'
import { Button } from '../components/Button/Button'
import { PageContainer } from '../components/PageContainer/PageContainer'
import { CompassLogo } from '../components/CompassLogo/CompassLogo'
import { useAuth } from '../context/authContext'
import { useRouter } from '../context/routerContext'
import './AuthPage.css'

/**
 * Authentication screen providing Login and Sign Up flows.
 * Includes client-side input validation, password visibility toggles,
 * and loading feedback before navigating to protected routes.
 */
export function AuthPage({ initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode) // 'login' | 'signup'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { login, register } = useAuth()
  const { navigate, routeState } = useRouter()

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear field-specific error as user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (mode === 'signup') {
      if (!formData.name.trim()) {
        newErrors.name = 'Full name is required.'
      } else if (formData.name.trim().length < 2) {
        newErrors.name = 'Please enter a valid full name.'
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.'
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address (e.g. name@domain.com).'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long.'
    }

    if (mode === 'signup') {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password.'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match.'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password)
      } else {
        await register(formData.name, formData.email, formData.password)
      }

      // Navigate to destination preserving intended route/action
      const destination = routeState?.redirectTo || '/dashboard'
      navigate(destination, { state: routeState })
    } catch {
      setErrors({ form: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setErrors({})
    setFormData((prev) => ({
      ...prev,
      confirmPassword: '',
    }))
  }

  return (
    <div className="ts-auth-wrapper">
      {/* Top Header with Back to Home */}
      <header className="ts-auth-header">
        <PageContainer size="narrow">
          <div className="ts-auth-header__inner">
            <a
              href="#"
              className="ts-brand"
              onClick={(e) => {
                e.preventDefault()
                navigate('/')
              }}
              aria-label="TripSync Home"
            >
              <CompassLogo size={24} />
              <span className="ts-brand__name">TripSync</span>
            </a>

            <a
              href="#"
              className="ts-auth-back-link"
              onClick={(e) => {
                e.preventDefault()
                navigate('/')
              }}
            >
              ← Return to Home
            </a>
          </div>
        </PageContainer>
      </header>

      {/* Main Authentication Card */}
      <main className="ts-auth-main">
        <PageContainer size="narrow">
          <div className="ts-auth-card">
            {/* Mode Switcher Tabs */}
            <div className="ts-auth-tabs" role="tablist" aria-label="Sign In or Sign Up">
              <button
                type="button"
                className={`ts-auth-tab ${mode === 'login' ? 'is-active' : ''}`}
                onClick={() => switchMode('login')}
                role="tab"
                aria-selected={mode === 'login'}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`ts-auth-tab ${mode === 'signup' ? 'is-active' : ''}`}
                onClick={() => switchMode('signup')}
                role="tab"
                aria-selected={mode === 'signup'}
              >
                Create Account
              </button>
            </div>

            <h1 className="ts-auth-title">
              {mode === 'login' ? 'Welcome Back' : 'Join TripSync'}
            </h1>
            <p className="ts-auth-subtitle">
              {mode === 'login'
                ? 'Sign in to access your planned journeys and budgets.'
                : 'Create an account to start planning your next journey with clarity.'}
            </p>

            {errors.form && (
              <div className="ts-general-error" role="alert">
                {errors.form}
              </div>
            )}

            <form onSubmit={handleSubmit} className="ts-auth-form" noValidate>
              {/* Registration: Name Field */}
              {mode === 'signup' && (
                <div className="ts-form-group">
                  <label htmlFor="auth-name" className="ts-label">
                    Full Name
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    autoComplete="name"
                    placeholder="e.g. Maya Lin"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`ts-input ${errors.name ? 'has-error' : ''}`}
                    disabled={isLoading}
                  />
                  {errors.name && (
                    <span className="ts-form-error" role="alert">
                      {errors.name}
                    </span>
                  )}
                </div>
              )}

              {/* Email Field */}
              <div className="ts-form-group">
                <label htmlFor="auth-email" className="ts-label">
                  Email Address
                </label>
                <input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@domain.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`ts-input ${errors.email ? 'has-error' : ''}`}
                  disabled={isLoading}
                />
                {errors.email && (
                  <span className="ts-form-error" role="alert">
                    {errors.email}
                  </span>
                )}
              </div>

              {/* Password Field with Visibility Toggle */}
              <div className="ts-form-group">
                <label htmlFor="auth-password" className="ts-label">
                  Password
                </label>
                <div className="ts-input-wrapper">
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={
                      mode === 'login' ? 'current-password' : 'new-password'
                    }
                    placeholder="At least 8 characters"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange('password', e.target.value)
                    }
                    className={`ts-input ${errors.password ? 'has-error' : ''}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="ts-password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <span className="ts-form-error" role="alert">
                    {errors.password}
                  </span>
                )}
              </div>

              {/* Registration: Confirm Password Field */}
              {mode === 'signup' && (
                <div className="ts-form-group">
                  <label htmlFor="auth-confirm-password" className="ts-label">
                    Confirm Password
                  </label>
                  <div className="ts-input-wrapper">
                    <input
                      id="auth-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Repeat password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange('confirmPassword', e.target.value)
                      }
                      className={`ts-input ${
                        errors.confirmPassword ? 'has-error' : ''
                      }`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="ts-password-toggle"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={
                        showConfirmPassword
                          ? 'Hide confirm password'
                          : 'Show confirm password'
                      }
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span className="ts-form-error" role="alert">
                      {errors.confirmPassword}
                    </span>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <Button
                variant="primary"
                size="lg"
                type="submit"
                disabled={isLoading}
                className="ts-auth-submit-btn"
              >
                {isLoading
                  ? mode === 'login'
                    ? 'Signing In...'
                    : 'Creating Account...'
                  : mode === 'login'
                  ? 'Sign In'
                  : 'Create Account'}
              </Button>
            </form>

            {/* Switch Text */}
            <p className="ts-auth-switch">
              {mode === 'login' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    className="ts-auth-switch-btn"
                    onClick={() => switchMode('signup')}
                  >
                    Create one
                  </button>
                </>
              ) : (
                <>
                  Already registered?{' '}
                  <button
                    type="button"
                    className="ts-auth-switch-btn"
                    onClick={() => switchMode('login')}
                  >
                    Sign in here
                  </button>
                </>
              )}
            </p>

            {/* Honest Integrity Notice */}
            <div className="ts-prototype-notice">
              <strong>Preview Notice:</strong> Client-side validation and in-memory session
              management are active for route testing. Live backend authentication (Node/Express
              &amp; MongoDB) will be connected in the backend integration milestone.
              Passwords are never saved in local storage.
            </div>
          </div>
        </PageContainer>
      </main>
    </div>
  )
}

export default AuthPage
