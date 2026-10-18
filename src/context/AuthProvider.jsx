import { useState } from 'react'
import { AuthContext } from './authContext'

/**
 * Authentication Context Provider for TripSync.
 * Manages client-side session state in-memory without storing plain-text passwords in localStorage.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  /**
   * Log in user with email and password.
   * Simulates an asynchronous authentication request.
   */
  const login = async (email) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const derivedName = email
          .split('@')[0]
          .replace(/[._-]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase())

        const authenticatedUser = {
          email: email.trim().toLowerCase(),
          name: derivedName || 'Traveler',
        }
        setUser(authenticatedUser)
        resolve(authenticatedUser)
      }, 400)
    })
  }

  /**
   * Register a new user with full name and email.
   * Simulates an asynchronous registration request.
   */
  const register = async (name, email) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser = {
          name: name.trim(),
          email: email.trim().toLowerCase(),
        }
        setUser(newUser)
        resolve(newUser)
      }, 400)
    })
  }

  /**
   * Log out user and clear current in-memory session.
   */
  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
