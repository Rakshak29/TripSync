import { AuthProvider } from './context/AuthProvider'
import { RouterProvider } from './context/RouterProvider'
import { WishlistProvider } from './context/WishlistProvider'
import { TripProvider } from './context/TripProvider'
import { useRouter } from './context/routerContext'
import { LandingPage } from './pages/LandingPage'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { CreateTripPage } from './pages/CreateTripPage'
import { TripWorkspacePage } from './pages/TripWorkspacePage'
import { WishlistPage } from './pages/WishlistPage'
import { DiscoverPlacesPage } from './pages/DiscoverPlacesPage'
import './App.css'

/**
 * Route Dispatcher based on RouterContext.
 */
function AppContent() {
  const { currentPath } = useRouter()

  if (currentPath === '/login') {
    return <AuthPage initialMode="login" />
  }

  if (currentPath === '/signup') {
    return <AuthPage initialMode="signup" />
  }

  if (currentPath === '/dashboard') {
    return <DashboardPage />
  }

  if (currentPath === '/trips/new') {
    return <CreateTripPage />
  }

  if (currentPath.startsWith('/trips/')) {
    const tripId = currentPath.replace('/trips/', '')
    return <TripWorkspacePage tripId={tripId} />
  }

  if (currentPath === '/wishlist') {
    return <WishlistPage />
  }

  if (currentPath === '/discover') {
    return <DiscoverPlacesPage />
  }

  return <LandingPage />
}

/**
 * Root Application Component.
 * Wraps tree with Auth, Trip, Wishlist, and Router context providers.
 */
function App() {
  return (
    <AuthProvider>
      <TripProvider>
        <WishlistProvider>
          <RouterProvider>
            <AppContent />
          </RouterProvider>
        </WishlistProvider>
      </TripProvider>
    </AuthProvider>
  )
}

export default App
