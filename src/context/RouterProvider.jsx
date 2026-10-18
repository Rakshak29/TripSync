import { useState, useEffect } from 'react'
import { RouterContext } from './routerContext'

/**
 * Lightweight, zero-dependency browser router for TripSync.
 * Keeps URL synchronized with browser history and supports route states.
 */
export function RouterProvider({ children }) {
  const [currentPath, setCurrentPath] = useState(
    () => window.location.pathname || '/'
  )
  const [routeState, setRouteState] = useState(null)

  useEffect(() => {
    const handlePopState = (event) => {
      setCurrentPath(window.location.pathname || '/')
      setRouteState(event.state || null)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  /**
   * Navigate to a new route.
   *
   * @param {string} path - Target URL path (e.g. '/login', '/dashboard', '/')
   * @param {Object} [options]
   * @param {any} [options.state=null] - State data preserved across the transition
   * @param {boolean} [options.replace=false] - Whether to replace the history entry
   */
  const navigate = (path, options = {}) => {
    const { state = null, replace = false } = options

    if (replace) {
      window.history.replaceState(state, '', path)
    } else {
      window.history.pushState(state, '', path)
    }

    setCurrentPath(path)
    setRouteState(state)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <RouterContext.Provider value={{ currentPath, routeState, navigate }}>
      {children}
    </RouterContext.Provider>
  )
}

export default RouterProvider
