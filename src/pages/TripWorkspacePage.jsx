import { useState, useEffect } from 'react'
import { Button } from '../components/Button/Button'
import { PageContainer } from '../components/PageContainer/PageContainer'
import { CompassLogo } from '../components/CompassLogo/CompassLogo'
import { useAuth } from '../context/authContext'
import { useRouter } from '../context/routerContext'
import { useTrips } from '../context/tripContext'
import {
  getTripStatus,
  getTripDurationDays,
  getTripDaysList,
  sortActivities,
  formatTimeDisplay,
  formatINR,
  calculateAverageBudget,
  EXPENSE_CATEGORIES,
  calculateTotalSpent,
  calculateRemainingBudget,
  calculateBudgetUsage,
  getCategoryBreakdown,
  formatExpenseDate,
  BOOKING_CATEGORIES,
  TRANSPORT_TYPES,
  formatBookingDate,
  formatTaskDueDate,
} from '../utils/tripUtils'
import './TripWorkspacePage.css'

/**
 * Dedicated Trip Workspace (/trips/:id).
 * Features trip summary metrics, day-by-day manual itinerary planning,
 * activity CRUD operations with persistence, and scoped budget breakdown.
 */
export function TripWorkspacePage({ tripId }) {
  const { user, isAuthenticated, logout } = useAuth()
  const { navigate } = useRouter()
  const {
    trips,
    updateTrip,
    deleteTrip,
    addActivity,
    updateActivity,
    deleteActivity,
    addExpense,
    updateExpense,
    deleteExpense,
    addBooking,
    updateBooking,
    deleteBooking,
    updateTripNotes,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
  } = useTrips()

  // Active workspace tab: 'overview' | 'itinerary' | 'bookings' | 'places' | 'budget'
  const [activeTab, setActiveTab] = useState('overview')

  // Selected date for day-by-day itinerary
  const [selectedDate, setSelectedDate] = useState('')

  // Add Activity modal state
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false)
  const [actName, setActName] = useState('')
  const [actTime, setActTime] = useState('')
  const [actLocation, setActLocation] = useState('')
  const [actNotes, setActNotes] = useState('')
  const [actError, setActError] = useState(null)

  // Edit Activity modal state
  const [editingActivity, setEditingActivity] = useState(null)
  const [editActName, setEditActName] = useState('')
  const [editActDate, setEditActDate] = useState('')
  const [editActTime, setEditActTime] = useState('')
  const [editActLocation, setEditActLocation] = useState('')
  const [editActNotes, setEditActNotes] = useState('')
  const [editActError, setEditActError] = useState(null)

  // Delete Activity confirmation state
  const [deletingActivity, setDeletingActivity] = useState(null)

  // Expense Filter state: 'all' | category
  const [expenseFilter, setExpenseFilter] = useState('all')

  // Add Expense modal state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [expTitle, setExpTitle] = useState('')
  const [expAmount, setExpAmount] = useState('')
  const [expCategory, setExpCategory] = useState('Transport')
  const [expDate, setExpDate] = useState('')
  const [expNotes, setExpNotes] = useState('')
  const [expError, setExpError] = useState(null)

  // Edit Expense modal state
  const [editingExpense, setEditingExpense] = useState(null)
  const [editExpTitle, setEditExpTitle] = useState('')
  const [editExpAmount, setEditExpAmount] = useState('')
  const [editExpCategory, setEditExpCategory] = useState('Transport')
  const [editExpDate, setEditExpDate] = useState('')
  const [editExpNotes, setEditExpNotes] = useState('')
  const [editExpError, setEditExpError] = useState(null)

  // Delete Expense confirmation state
  const [deletingExpense, setDeletingExpense] = useState(null)

  // Booking Filter state: 'all' | 'accommodation' | 'transport' | 'activity'
  const [bookingFilter, setBookingFilter] = useState('all')

  // Add Booking modal state
  const [isAddBookingOpen, setIsAddBookingOpen] = useState(false)
  const [bkCategory, setBkCategory] = useState('accommodation')
  const [bkName, setBkName] = useState('')
  const [bkLocation, setBkLocation] = useState('')
  const [bkCheckInDate, setBkCheckInDate] = useState('')
  const [bkCheckOutDate, setBkCheckOutDate] = useState('')
  const [bkBookingRef, setBkBookingRef] = useState('')
  const [bkContactNumber, setBkContactNumber] = useState('')
  const [bkTransportType, setBkTransportType] = useState('Flight')
  const [bkOperator, setBkOperator] = useState('')
  const [bkDepartureLocation, setBkDepartureLocation] = useState('')
  const [bkArrivalLocation, setBkArrivalLocation] = useState('')
  const [bkDepartureDateTime, setBkDepartureDateTime] = useState('')
  const [bkArrivalDateTime, setBkArrivalDateTime] = useState('')
  const [bkReservationDateTime, setBkReservationDateTime] = useState('')
  const [bkContactInfo, setBkContactInfo] = useState('')
  const [bkNotes, setBkNotes] = useState('')
  const [bkError, setBkError] = useState(null)

  // Edit Booking modal state
  const [editingBooking, setEditingBooking] = useState(null)
  const [editBkCategory, setEditBkCategory] = useState('accommodation')
  const [editBkName, setEditBkName] = useState('')
  const [editBkLocation, setEditBkLocation] = useState('')
  const [editBkCheckInDate, setEditBkCheckInDate] = useState('')
  const [editBkCheckOutDate, setEditBkCheckOutDate] = useState('')
  const [editBkBookingRef, setEditBkBookingRef] = useState('')
  const [editBkContactNumber, setEditBkContactNumber] = useState('')
  const [editBkTransportType, setEditBkTransportType] = useState('Flight')
  const [editBkOperator, setEditBkOperator] = useState('')
  const [editBkDepartureLocation, setEditBkDepartureLocation] = useState('')
  const [editBkArrivalLocation, setEditBkArrivalLocation] = useState('')
  const [editBkDepartureDateTime, setEditBkDepartureDateTime] = useState('')
  const [editBkArrivalDateTime, setEditBkArrivalDateTime] = useState('')
  const [editBkReservationDateTime, setEditBkReservationDateTime] = useState('')
  const [editBkContactInfo, setEditBkContactInfo] = useState('')
  const [editBkNotes, setEditBkNotes] = useState('')
  const [editBkError, setEditBkError] = useState(null)

  // Delete Booking confirmation state
  const [deletingBooking, setDeletingBooking] = useState(null)

  // Direct Notes editing state
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [notesDraft, setNotesDraft] = useState('')
  const [notesError, setNotesError] = useState(null)

  // Task Filter state: 'all' | 'pending' | 'completed'
  const [taskFilter, setTaskFilter] = useState('all')

  // Add Task modal state
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDueDate, setTaskDueDate] = useState('')
  const [taskDesc, setTaskDesc] = useState('')
  const [taskError, setTaskError] = useState(null)

  // Edit Task modal state
  const [editingTask, setEditingTask] = useState(null)
  const [editTaskTitle, setEditTaskTitle] = useState('')
  const [editTaskDueDate, setEditTaskDueDate] = useState('')
  const [editTaskDesc, setEditTaskDesc] = useState('')
  const [editTaskCompleted, setEditTaskCompleted] = useState(false)
  const [editTaskError, setEditTaskError] = useState(null)

  // Delete Task confirmation state
  const [deletingTask, setDeletingTask] = useState(null)

  // Edit Trip modal state
  const [isEditingTrip, setIsEditingTrip] = useState(false)
  const [editTripName, setEditTripName] = useState('')
  const [editTripDestination, setEditTripDestination] = useState('')
  const [editTripStartDate, setEditTripStartDate] = useState('')
  const [editTripEndDate, setEditTripEndDate] = useState('')
  const [editTripTravelers, setEditTripTravelers] = useState(2)
  const [editTripBudget, setEditTripBudget] = useState('')
  const [editTripNotes, setEditTripNotes] = useState('')
  const [editTripErrors, setEditTripErrors] = useState({})

  // Delete Trip confirmation modal state
  const [isDeletingTrip, setIsDeletingTrip] = useState(false)

  // Route protection
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: { redirectTo: `/trips/${tripId}` },
        replace: true,
      })
    }
  }, [isAuthenticated, navigate, tripId])

  if (!isAuthenticated || !user) {
    return null
  }

  const trip = trips.find((t) => t.id === tripId)

  // Populate edit fields when opening edit modal
  const handleOpenEditTrip = () => {
    if (!trip) return
    setEditTripName(trip.name)
    setEditTripDestination(trip.destination)
    setEditTripStartDate(trip.startDate)
    setEditTripEndDate(trip.endDate)
    setEditTripTravelers(trip.travelers || 2)
    setEditTripBudget(
      trip.budget !== null && trip.budget !== undefined && !isNaN(trip.budget)
        ? String(trip.budget)
        : ''
    )
    setEditTripNotes(trip.notes || '')
    setEditTripErrors({})
    setIsEditingTrip(true)
  }

  const handleSaveEditTrip = (e) => {
    e.preventDefault()
    const errs = {}
    if (!editTripName.trim()) {
      errs.name = 'Trip name is required.'
    }
    if (!editTripDestination.trim()) {
      errs.destination = 'Destination is required.'
    }
    if (!editTripStartDate) {
      errs.startDate = 'Start date is required.'
    }
    if (!editTripEndDate) {
      errs.endDate = 'End date is required.'
    }
    if (editTripStartDate && editTripEndDate && editTripEndDate < editTripStartDate) {
      errs.endDate = 'End date cannot precede start date.'
    }
    if (!editTripTravelers || editTripTravelers < 1) {
      errs.travelers = 'At least 1 traveler is required.'
    } else if (editTripTravelers > 50) {
      errs.travelers = 'Traveler count cannot exceed 50.'
    }

    const numBudget = Number(editTripBudget)
    if (
      editTripBudget === '' ||
      editTripBudget === null ||
      editTripBudget === undefined ||
      isNaN(numBudget) ||
      numBudget <= 0
    ) {
      errs.budget = 'Total estimated budget is required and must be greater than zero.'
    }

    if (Object.keys(errs).length > 0) {
      setEditTripErrors(errs)
      return
    }

    const res = updateTrip(trip.id, {
      name: editTripName,
      destination: editTripDestination,
      startDate: editTripStartDate,
      endDate: editTripEndDate,
      travelers: editTripTravelers,
      budget: numBudget,
      notes: editTripNotes,
    })

    if (!res.success) {
      setEditTripErrors({ form: res.error })
      return
    }

    setIsEditingTrip(false)
  }

  const handleConfirmDeleteTrip = () => {
    deleteTrip(trip.id)
    setIsDeletingTrip(false)
    navigate('/dashboard')
  }

  // --- Itinerary Handlers ---
  const handleOpenAddActivity = () => {
    setActName('')
    setActTime('')
    setActLocation('')
    setActNotes('')
    setActError(null)
    setIsAddActivityOpen(true)
  }

  const handleSubmitAddActivity = (e, targetDate) => {
    e.preventDefault()
    setActError(null)

    if (!actName.trim()) {
      setActError('Activity name is required.')
      return
    }

    const result = addActivity(trip.id, {
      name: actName,
      date: targetDate,
      time: actTime,
      location: actLocation,
      notes: actNotes,
    })

    if (!result.success) {
      setActError(result.error || 'Failed to add activity.')
      return
    }

    setIsAddActivityOpen(false)
  }

  const handleOpenEditActivity = (activity) => {
    setEditingActivity(activity)
    setEditActName(activity.name)
    setEditActDate(activity.date)
    setEditActTime(activity.time || '')
    setEditActLocation(activity.location || '')
    setEditActNotes(activity.notes || '')
    setEditActError(null)
  }

  const handleSubmitEditActivity = (e) => {
    e.preventDefault()
    setEditActError(null)

    if (!editActName.trim()) {
      setEditActError('Activity name is required.')
      return
    }

    const result = updateActivity(trip.id, editingActivity.id, {
      name: editActName,
      date: editActDate,
      time: editActTime,
      location: editActLocation,
      notes: editActNotes,
    })

    if (!result.success) {
      setEditActError(result.error || 'Failed to update activity.')
      return
    }

    setEditingActivity(null)
  }

  const handleConfirmDeleteActivity = () => {
    if (!deletingActivity) return
    deleteActivity(trip.id, deletingActivity.id)
    setDeletingActivity(null)
  }

  // --- Expense Handlers ---
  const handleOpenAddExpense = () => {
    setExpTitle('')
    setExpAmount('')
    setExpCategory('Transport')
    setExpDate(trip?.startDate || new Date().toISOString().split('T')[0])
    setExpNotes('')
    setExpError(null)
    setIsAddExpenseOpen(true)
  }

  const handleSubmitAddExpense = (e) => {
    e.preventDefault()
    setExpError(null)

    if (!expTitle.trim()) {
      setExpError('Expense title is required.')
      return
    }
    const num = Number(expAmount)
    if (expAmount === '' || isNaN(num) || num <= 0) {
      setExpError('Amount is required and must be greater than zero.')
      return
    }
    if (!expDate) {
      setExpError('Expense date is required.')
      return
    }

    const result = addExpense(trip.id, {
      title: expTitle,
      amount: num,
      category: expCategory,
      date: expDate,
      notes: expNotes,
    })

    if (!result.success) {
      setExpError(result.error || 'Failed to add expense.')
      return
    }

    setIsAddExpenseOpen(false)
  }

  const handleOpenEditExpense = (expense) => {
    setEditingExpense(expense)
    setEditExpTitle(expense.title)
    setEditExpAmount(String(expense.amount))
    setEditExpCategory(expense.category || 'Other')
    setEditExpDate(expense.date || '')
    setEditExpNotes(expense.notes || '')
    setEditExpError(null)
  }

  const handleSubmitEditExpense = (e) => {
    e.preventDefault()
    setEditExpError(null)

    if (!editExpTitle.trim()) {
      setEditExpError('Expense title is required.')
      return
    }
    const num = Number(editExpAmount)
    if (editExpAmount === '' || isNaN(num) || num <= 0) {
      setEditExpError('Amount is required and must be greater than zero.')
      return
    }
    if (!editExpDate) {
      setEditExpError('Expense date is required.')
      return
    }

    const result = updateExpense(trip.id, editingExpense.id, {
      title: editExpTitle,
      amount: num,
      category: editExpCategory,
      date: editExpDate,
      notes: editExpNotes,
    })

    if (!result.success) {
      setEditExpError(result.error || 'Failed to update expense.')
      return
    }

    setEditingExpense(null)
  }

  const handleConfirmDeleteExpense = () => {
    if (!deletingExpense) return
    deleteExpense(trip.id, deletingExpense.id)
    setDeletingExpense(null)
  }

  // --- Booking Handlers ---
  const handleOpenAddBooking = (category = 'accommodation') => {
    setBkCategory(category)
    setBkName('')
    setBkLocation('')
    setBkCheckInDate(trip?.startDate || '')
    setBkCheckOutDate(trip?.endDate || '')
    setBkBookingRef('')
    setBkContactNumber('')
    setBkTransportType('Flight')
    setBkOperator('')
    setBkDepartureLocation('')
    setBkArrivalLocation('')
    setBkDepartureDateTime('')
    setBkArrivalDateTime('')
    setBkReservationDateTime('')
    setBkContactInfo('')
    setBkNotes('')
    setBkError(null)
    setIsAddBookingOpen(true)
  }

  const handleSubmitAddBooking = (e) => {
    e.preventDefault()
    setBkError(null)

    const payload = {
      category: bkCategory,
      name: bkName,
      location: bkLocation,
      checkInDate: bkCheckInDate,
      checkOutDate: bkCheckOutDate,
      bookingRef: bkBookingRef,
      contactNumber: bkContactNumber,
      transportType: bkTransportType,
      operator: bkOperator,
      departureLocation: bkDepartureLocation,
      arrivalLocation: bkArrivalLocation,
      departureDateTime: bkDepartureDateTime,
      arrivalDateTime: bkArrivalDateTime,
      reservationDateTime: bkReservationDateTime,
      contactInfo: bkContactInfo,
      notes: bkNotes,
    }

    const result = addBooking(trip.id, payload)
    if (!result.success) {
      setBkError(result.error || 'Failed to save booking.')
      return
    }

    setIsAddBookingOpen(false)
  }

  const handleOpenEditBooking = (booking) => {
    let cat = (booking.category || '').toLowerCase().trim()
    if (!cat) {
      if (booking.transportType) cat = 'transport'
      else if (booking.reservationDateTime) cat = 'activity'
      else cat = 'accommodation'
    }
    setEditingBooking(booking)
    setEditBkCategory(cat)
    setEditBkName(booking.name || booking.propertyName || '')
    setEditBkLocation(booking.location || booking.address || '')
    setEditBkCheckInDate(booking.checkInDate || '')
    setEditBkCheckOutDate(booking.checkOutDate || '')
    setEditBkBookingRef(booking.bookingRef || booking.reference || '')
    setEditBkContactNumber(booking.contactNumber || booking.contact || '')
    setEditBkTransportType(booking.transportType || 'Flight')
    setEditBkOperator(booking.operator || '')
    setEditBkDepartureLocation(booking.departureLocation || '')
    setEditBkArrivalLocation(booking.arrivalLocation || '')
    setEditBkDepartureDateTime(booking.departureDateTime || '')
    setEditBkArrivalDateTime(booking.arrivalDateTime || '')
    setEditBkReservationDateTime(booking.reservationDateTime || '')
    setEditBkContactInfo(booking.contactInfo || booking.contact || '')
    setEditBkNotes(booking.notes || '')
    setEditBkError(null)
  }

  const handleSubmitEditBooking = (e) => {
    e.preventDefault()
    setEditBkError(null)

    const payload = {
      category: editBkCategory,
      name: editBkName,
      location: editBkLocation,
      checkInDate: editBkCheckInDate,
      checkOutDate: editBkCheckOutDate,
      bookingRef: editBkBookingRef,
      contactNumber: editBkContactNumber,
      transportType: editBkTransportType,
      operator: editBkOperator,
      departureLocation: editBkDepartureLocation,
      arrivalLocation: editBkArrivalLocation,
      departureDateTime: editBkDepartureDateTime,
      arrivalDateTime: editBkArrivalDateTime,
      reservationDateTime: editBkReservationDateTime,
      contactInfo: editBkContactInfo,
      notes: editBkNotes,
    }

    const result = updateBooking(trip.id, editingBooking.id, payload)
    if (!result.success) {
      setEditBkError(result.error || 'Failed to update booking.')
      return
    }

    setEditingBooking(null)
  }

  const handleConfirmDeleteBooking = () => {
    if (!deletingBooking) return
    deleteBooking(trip.id, deletingBooking.id)
    setDeletingBooking(null)
  }

  // --- Additional Notes Handlers ---
  const handleSaveNotes = (e) => {
    e.preventDefault()
    setNotesError(null)
    const res = updateTripNotes(trip.id, notesDraft)
    if (!res.success) {
      setNotesError(res.error || 'Failed to update notes.')
      return
    }
    setIsEditingNotes(false)
  }

  // --- Task Handlers ---
  const handleOpenAddTask = () => {
    setTaskTitle('')
    setTaskDueDate('')
    setTaskDesc('')
    setTaskError(null)
    setIsAddTaskOpen(true)
  }

  const handleSubmitAddTask = (e) => {
    e.preventDefault()
    setTaskError(null)
    const res = addTask(trip.id, {
      title: taskTitle,
      dueDate: taskDueDate,
      description: taskDesc,
    })
    if (!res.success) {
      setTaskError(res.error || 'Failed to add task.')
      return
    }
    setIsAddTaskOpen(false)
  }

  const handleOpenEditTask = (task) => {
    setEditingTask(task)
    setEditTaskTitle(task.title || '')
    setEditTaskDueDate(task.dueDate || '')
    setEditTaskDesc(task.description || task.notes || '')
    setEditTaskCompleted(Boolean(task.completed))
    setEditTaskError(null)
  }

  const handleSubmitEditTask = (e) => {
    e.preventDefault()
    setEditTaskError(null)
    const res = updateTask(trip.id, editingTask.id, {
      title: editTaskTitle,
      dueDate: editTaskDueDate,
      description: editTaskDesc,
      completed: editTaskCompleted,
    })
    if (!res.success) {
      setEditTaskError(res.error || 'Failed to update task.')
      return
    }
    setEditingTask(null)
  }

  const handleToggleTask = (taskId) => {
    toggleTask(trip.id, taskId)
  }

  const handleConfirmDeleteTask = () => {
    if (!deletingTask) return
    deleteTask(trip.id, deletingTask.id)
    setDeletingTask(null)
  }

  const userInitial = user.name ? user.name.charAt(0) : 'T'

  // If trip not found
  if (!trip) {
    return (
      <div className="ts-workspace-wrapper">
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
              >
                <CompassLogo size={26} />
                <span className="ts-brand__name">TripSync</span>
              </a>
            </div>
          </PageContainer>
        </header>

        <main className="ts-workspace-main">
          <PageContainer>
            <div className="ts-not-found-card">
              <h2 className="ts-modal-title">Trip Not Found</h2>
              <p className="ts-modal-desc">
                The requested journey may have been deleted or the link is invalid.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/dashboard')}
              >
                ← Return to Dashboard
              </Button>
            </div>
          </PageContainer>
        </main>
      </div>
    )
  }

  const status = getTripStatus(trip.startDate, trip.endDate)
  const durationDays = getTripDurationDays(trip.startDate, trip.endDate)
  const averagePerTraveler = calculateAverageBudget(trip.budget, trip.travelers)

  // Itinerary days list derived from start and end dates
  const days = getTripDaysList(trip.startDate, trip.endDate)
  const activeDate = days.some((d) => d.dateString === selectedDate)
    ? selectedDate
    : days[0]?.dateString || ''
  const activeDay = days.find((d) => d.dateString === activeDate) || days[0]

  // Activities for currently active day
  const allActivities = Array.isArray(trip.itinerary) ? trip.itinerary : []
  const activeDayActivities = sortActivities(
    allActivities.filter((act) => act.date === activeDate)
  )

  // Out of range activities (if dates were shortened)
  const outOfRangeActivities = allActivities.filter(
    (act) => !days.some((d) => d.dateString === act.date)
  )

  // Expenses data and calculations
  const allExpenses = Array.isArray(trip.expenses) ? trip.expenses : []
  const totalSpent = calculateTotalSpent(allExpenses)
  const remainingBudget = calculateRemainingBudget(trip.budget, totalSpent)
  const budgetUsage = calculateBudgetUsage(trip.budget, totalSpent)
  const categoryBreakdown = getCategoryBreakdown(allExpenses)

  const filteredExpenses =
    expenseFilter === 'all'
      ? allExpenses
      : allExpenses.filter(
          (e) => (e.category || '').toLowerCase() === expenseFilter.toLowerCase()
        )

  // Bookings data and calculations (defensively normalize categories)
  const allBookings = Array.isArray(trip.bookings)
    ? trip.bookings.map((bk) => {
        let cat = (bk.category || '').toLowerCase().trim()
        if (!cat) {
          if (bk.transportType) cat = 'transport'
          else if (bk.reservationDateTime) cat = 'activity'
          else cat = 'accommodation'
        }
        return {
          ...bk,
          category: cat,
        }
      })
    : []
  const filteredBookings =
    bookingFilter === 'all'
      ? allBookings
      : allBookings.filter((b) => (b.category || '').toLowerCase() === bookingFilter.toLowerCase())
  const accommodationCount = allBookings.filter((b) => (b.category || '').toLowerCase() === 'accommodation').length
  const transportCount = allBookings.filter((b) => (b.category || '').toLowerCase() === 'transport').length
  const activityCount = allBookings.filter((b) => (b.category || '').toLowerCase() === 'activity').length

  // Tasks data and counts
  const allTasks = Array.isArray(trip.tasks) ? trip.tasks : []
  const pendingTasksCount = allTasks.filter((t) => !t.completed).length
  const completedTasksCount = allTasks.filter((t) => t.completed).length
  const filteredTasks = allTasks.filter((t) => {
    if (taskFilter === 'pending') return !t.completed
    if (taskFilter === 'completed') return t.completed
    return true
  })

  // Format date range (e.g. 15 Jan 2027 to 22 Jan 2027)
  const formatDateString = (dateStr) => {
    try {
      const parts = dateStr.split('-')
      const d = new Date(parts[0], parts[1] - 1, parts[2])
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="ts-workspace-wrapper">
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

      {/* Main Workspace */}
      <main className="ts-workspace-main">
        <PageContainer>
          {/* Top Navigation & Action Bar */}
          <div className="ts-workspace-nav">
            <button
              type="button"
              className="ts-back-btn"
              onClick={() => navigate('/dashboard')}
            >
              ← Back to Dashboard
            </button>

            <div className="ts-workspace-actions">
              <Button variant="secondary" size="sm" onClick={handleOpenEditTrip}>
                ✎ Edit Trip Details
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsDeletingTrip(true)}
                style={{
                  color: 'var(--color-error)',
                  borderColor: 'var(--color-border)',
                }}
              >
                🗑️ Delete Trip
              </Button>
            </div>
          </div>

          {/* Hero Banner */}
          <section className="ts-workspace-hero" aria-label="Trip Summary">
            <div className="ts-workspace-header-top">
              <div className="ts-workspace-title-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <h1 className="ts-workspace-title">{trip.name}</h1>
                  <span className={`ts-trip-status-pill is-${status.toLowerCase()}`}>
                    ● {status}
                  </span>
                </div>
                <span className="ts-workspace-destination">
                  📍 {trip.destination} • 🗓️ {formatDateString(trip.startDate)} to{' '}
                  {formatDateString(trip.endDate)} ({durationDays}{' '}
                  {durationDays === 1 ? 'day' : 'days'}) • 👥 {trip.travelers}{' '}
                  {trip.travelers === 1 ? 'traveler' : 'travelers'}
                </span>
              </div>
            </div>
          </section>

          {/* Workspace Tabs */}
          <nav className="ts-workspace-tabs" aria-label="Trip Workspace Sections">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'itinerary', label: 'Itinerary' },
              { id: 'bookings', label: 'Bookings & Travel' },
              { id: 'budget', label: 'Budget & Expenses' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`ts-tab-btn ${
                  activeTab === tab.id || (tab.id === 'bookings' && activeTab === 'places')
                    ? 'is-active'
                    : ''
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="ts-overview-tab-content">
              {/* 4 Focused Stat Cards */}
              <div className="ts-workspace-stats-grid">
                <div className="ts-stat-card">
                  <span className="ts-stat-label">Companions</span>
                  <span className="ts-stat-value">
                    {trip.travelers} {trip.travelers === 1 ? 'Traveler' : 'Travelers'}
                  </span>
                  <span className="ts-stat-desc">
                    {trip.travelers === 1
                      ? 'Solo journey'
                      : `${trip.travelers} people traveling together`}
                  </span>
                </div>

                <div className="ts-stat-card">
                  <span className="ts-stat-label">Duration</span>
                  <span className="ts-stat-value">
                    {durationDays} {durationDays === 1 ? 'Day' : 'Days'}
                  </span>
                  <span className="ts-stat-desc">
                    {trip.startDate} to {trip.endDate}
                  </span>
                </div>

                <div className="ts-stat-card">
                  <span className="ts-stat-label">Total Estimated Budget</span>
                  <span className="ts-stat-value">
                    {formatINR(trip.budget)}
                  </span>
                  <span className="ts-stat-desc">
                    Total budget for entire trip
                  </span>
                </div>

                <div className="ts-stat-card">
                  <span className="ts-stat-label">Average per Traveler</span>
                  <span className="ts-stat-value">
                    {averagePerTraveler !== null ? formatINR(averagePerTraveler) : 'Unset'}
                  </span>
                  <span className="ts-stat-desc">
                    Average across {trip.travelers}{' '}
                    {trip.travelers === 1 ? 'traveler' : 'travelers'}
                  </span>
                </div>
              </div>

              {/* Overview Content Cards: Editable Notes & To-Do List */}
              <div className="ts-overview-cards-col">
                {/* Additional Notes Card with Direct Inline Editing */}
                <div className="ts-content-card">
                  <div className="ts-content-card-header">
                    <h2 className="ts-content-card-title">Additional Notes</h2>
                    {!isEditingNotes && (
                      <button
                        type="button"
                        className="ts-activity-action-btn"
                        onClick={() => {
                          setNotesDraft(trip.notes || '')
                          setNotesError(null)
                          setIsEditingNotes(true)
                        }}
                        aria-label={trip.notes ? 'Edit additional notes' : 'Add additional notes'}
                      >
                        {trip.notes ? '✎ Edit Notes' : '+ Add Notes'}
                      </button>
                    )}
                  </div>

                  {isEditingNotes ? (
                    <form onSubmit={handleSaveNotes} className="ts-notes-edit-box">
                      {notesError && (
                        <div className="ts-general-error" role="alert">
                          {notesError}
                        </div>
                      )}
                      <textarea
                        id="overview-notes-editor"
                        rows={4}
                        placeholder="Document accommodation details, booking references, packing items, or specific recommendations..."
                        value={notesDraft}
                        onChange={(e) => setNotesDraft(e.target.value)}
                        className="ts-input-field"
                        autoFocus
                      />
                      <div className="ts-notes-actions">
                        <Button
                          variant="secondary"
                          size="sm"
                          type="button"
                          onClick={() => {
                            setNotesDraft(trip.notes || '')
                            setNotesError(null)
                            setIsEditingNotes(false)
                          }}
                        >
                          Cancel
                        </Button>
                        <Button variant="primary" size="sm" type="submit">
                          Save Notes
                        </Button>
                      </div>
                    </form>
                  ) : trip.notes ? (
                    <p className="ts-notes-text">{trip.notes}</p>
                  ) : (
                    <div className="ts-notes-empty-wrap">
                      <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-subtle)' }}>
                        No notes added yet. Use notes to document accommodation details, booking
                        references, packing items, or specific trip recommendations.
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setNotesDraft('')
                          setNotesError(null)
                          setIsEditingNotes(true)
                        }}
                      >
                        + Add Notes
                      </Button>
                    </div>
                  )}
                </div>

                {/* Trip To-Do List Card (Milestone 6) */}
                <div className="ts-content-card">
                  <div className="ts-content-card-header">
                    <div className="ts-todo-header-title-group">
                      <h2 className="ts-content-card-title">Trip To-Do List</h2>
                      <div className="ts-todo-badges">
                        <span className="ts-todo-count-badge is-pending">
                          {pendingTasksCount} Pending
                        </span>
                        <span className="ts-todo-count-badge is-completed">
                          {completedTasksCount} Completed
                        </span>
                      </div>
                    </div>

                    <div className="ts-todo-header-actions">
                      {allTasks.length > 0 && (
                        <div className="ts-todo-filter-group" role="group" aria-label="Filter tasks">
                          <button
                            type="button"
                            className={`ts-filter-pill-btn ${taskFilter === 'all' ? 'is-active' : ''}`}
                            onClick={() => setTaskFilter('all')}
                          >
                            All ({allTasks.length})
                          </button>
                          <button
                            type="button"
                            className={`ts-filter-pill-btn ${taskFilter === 'pending' ? 'is-active' : ''}`}
                            onClick={() => setTaskFilter('pending')}
                          >
                            Pending ({pendingTasksCount})
                          </button>
                          <button
                            type="button"
                            className={`ts-filter-pill-btn ${taskFilter === 'completed' ? 'is-active' : ''}`}
                            onClick={() => setTaskFilter('completed')}
                          >
                            Completed ({completedTasksCount})
                          </button>
                        </div>
                      )}

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleOpenAddTask}
                      >
                        + Add Task
                      </Button>
                    </div>
                  </div>

                  {allTasks.length === 0 ? (
                    <div className="ts-itinerary-empty-card" style={{ padding: 'var(--space-8)' }}>
                      <div className="ts-itinerary-empty-icon">☑️</div>
                      <h3 className="ts-itinerary-empty-title">No to-do tasks yet</h3>
                      <p className="ts-itinerary-empty-desc">
                        Keep track of packing essentials, visa papers, reservations, and pre-departure errands for {trip.name}.
                      </p>
                      <Button variant="primary" size="sm" onClick={handleOpenAddTask}>
                        + Add First Task
                      </Button>
                    </div>
                  ) : filteredTasks.length === 0 ? (
                    <div className="ts-itinerary-empty-card" style={{ padding: 'var(--space-6)' }}>
                      <h3 className="ts-itinerary-empty-title">No {taskFilter} tasks</h3>
                      <p className="ts-itinerary-empty-desc">
                        You have no tasks matching the &ldquo;{taskFilter}&rdquo; filter.
                      </p>
                      <Button variant="secondary" size="sm" onClick={() => setTaskFilter('all')}>
                        Show All Tasks
                      </Button>
                    </div>
                  ) : (
                    <div className="ts-todo-list" role="list">
                      {filteredTasks.map((task) => {
                        const formattedDue = formatTaskDueDate(task.dueDate, trip.startDate, trip.endDate)
                        return (
                          <div
                            key={task.id}
                            className={`ts-todo-item ${task.completed ? 'is-completed' : ''}`}
                            role="listitem"
                          >
                            <div className="ts-todo-item-left">
                              <div className="ts-todo-checkbox-wrap">
                                <input
                                  id={`task-check-${task.id}`}
                                  type="checkbox"
                                  className="ts-todo-checkbox"
                                  checked={task.completed}
                                  onChange={() => handleToggleTask(task.id)}
                                  aria-label={`Mark task "${task.title}" as ${task.completed ? 'pending' : 'completed'}`}
                                />
                              </div>

                              <div className="ts-todo-content">
                                <label
                                  htmlFor={`task-check-${task.id}`}
                                  className={`ts-todo-title ${task.completed ? 'is-completed' : ''}`}
                                  style={{ cursor: 'pointer' }}
                                >
                                  {task.title}
                                </label>

                                {(formattedDue || task.description) && (
                                  <div className="ts-todo-meta">
                                    {formattedDue && (
                                      <span className="ts-todo-due-tag">
                                        🗓️ Due: {formattedDue}
                                      </span>
                                    )}
                                    {task.description && (
                                      <span className="ts-todo-desc">
                                        {task.description}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="ts-todo-actions">
                              <button
                                type="button"
                                className="ts-activity-action-btn"
                                onClick={() => handleOpenEditTask(task)}
                                aria-label={`Edit ${task.title}`}
                              >
                                ✎ Edit
                              </button>
                              <button
                                type="button"
                                className="ts-activity-action-btn is-delete"
                                onClick={() => setDeletingTask(task)}
                                aria-label={`Delete ${task.title}`}
                              >
                                ✕ Delete
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}



          {/* TAB 2: ITINERARY (Milestone 3 Functional Implementation) */}
          {activeTab === 'itinerary' && (
            <div className="ts-itinerary-wrapper">
              {days.length === 0 ? (
                /* Fallback if dates are invalid */
                <div className="ts-itinerary-empty-card">
                  <div className="ts-itinerary-empty-icon">🗓️</div>
                  <h3 className="ts-itinerary-empty-title">No Travel Dates Available</h3>
                  <p className="ts-itinerary-empty-desc">
                    Trip dates are required to organize day-by-day activities. Please update your
                    trip dates to enable scheduling.
                  </p>
                  <Button variant="primary" size="sm" onClick={handleOpenEditTrip}>
                    ✎ Edit Trip Dates
                  </Button>
                </div>
              ) : (
                <>
                  {/* Horizontal Day Navigation */}
                  <div
                    className="ts-itinerary-days-scroll"
                    role="tablist"
                    aria-label="Trip Days Navigation"
                  >
                    {days.map((day) => {
                      const isSelected = day.dateString === activeDate
                      const dayCount = allActivities.filter(
                        (a) => a.date === day.dateString
                      ).length

                      return (
                        <button
                          key={day.dateString}
                          type="button"
                          role="tab"
                          aria-selected={isSelected}
                          className={`ts-day-nav-card ${isSelected ? 'is-active' : ''}`}
                          onClick={() => setSelectedDate(day.dateString)}
                        >
                          <div className="ts-day-nav-top">
                            <span className="ts-day-nav-num">Day {day.dayNumber}</span>
                            {dayCount > 0 && (
                              <span className="ts-day-nav-badge">
                                {dayCount} {dayCount === 1 ? 'act' : 'acts'}
                              </span>
                            )}
                          </div>
                          <span className="ts-day-nav-date">{day.formattedDate}</span>
                          <span className="ts-day-nav-weekday">{day.dayOfWeek}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Active Day Header */}
                  <div className="ts-active-day-header">
                    <div className="ts-active-day-info">
                      <h2 className="ts-active-day-title">
                        {activeDay ? activeDay.label : 'Selected Day'}
                      </h2>
                      <span className="ts-active-day-subtitle">
                        {activeDay?.dayOfWeek} •{' '}
                        {activeDayActivities.length === 0
                          ? 'No activities scheduled yet'
                          : `${activeDayActivities.length} ${
                              activeDayActivities.length === 1
                                ? 'activity'
                                : 'activities'
                            } scheduled`}
                      </span>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleOpenAddActivity}
                    >
                      + Add Activity
                    </Button>
                  </div>

                  {/* Activities List for Selected Day */}
                  {activeDayActivities.length === 0 ? (
                    <div className="ts-itinerary-empty-card">
                      <div className="ts-itinerary-empty-icon">📝</div>
                      <h3 className="ts-itinerary-empty-title">
                        No activities scheduled for Day {activeDay?.dayNumber}
                      </h3>
                      <p className="ts-itinerary-empty-desc">
                        Start organizing your day on {activeDay?.formattedDate}. Add visits to
                        attractions, local dining spots, walking tours, or transit details.
                      </p>
                      <Button
                        variant="primary"
                        size="md"
                        onClick={handleOpenAddActivity}
                      >
                        + Add Activity
                      </Button>
                    </div>
                  ) : (
                    <div className="ts-activities-list">
                      {activeDayActivities.map((activity) => (
                        <article key={activity.id} className="ts-activity-card">
                          <div className="ts-activity-top-row">
                            <div className="ts-activity-title-wrap">
                              <span
                                className={`ts-activity-time-pill ${
                                  activity.time ? '' : 'is-flexible'
                                }`}
                              >
                                ⏰ {activity.time ? formatTimeDisplay(activity.time) : 'Flexible Time'}
                              </span>
                              <h3 className="ts-activity-name">{activity.name}</h3>
                            </div>

                            <div className="ts-activity-actions">
                              <button
                                type="button"
                                className="ts-activity-action-btn"
                                onClick={() => handleOpenEditActivity(activity)}
                                aria-label={`Edit ${activity.name}`}
                              >
                                ✎ Edit
                              </button>
                              <button
                                type="button"
                                className="ts-activity-action-btn is-delete"
                                onClick={() => setDeletingActivity(activity)}
                                aria-label={`Delete ${activity.name}`}
                              >
                                ✕ Delete
                              </button>
                            </div>
                          </div>

                          {(activity.location || activity.notes) && (
                            <div className="ts-activity-meta">
                              {activity.location && (
                                <span className="ts-activity-location">
                                  📍 {activity.location}
                                </span>
                              )}
                              {activity.notes && (
                                <p className="ts-activity-notes">{activity.notes}</p>
                              )}
                            </div>
                          )}
                        </article>
                      ))}
                    </div>
                  )}

                  {/* Graceful Handling of Out-of-Range Activities if trip dates were edited */}
                  {outOfRangeActivities.length > 0 && (
                    <div className="ts-out-of-range-banner" role="status">
                      <strong>
                        Notice: You have {outOfRangeActivities.length}{' '}
                        {outOfRangeActivities.length === 1 ? 'activity' : 'activities'} scheduled
                        on dates outside your current trip range:
                      </strong>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        {outOfRangeActivities.map((outAct) => (
                          <div
                            key={outAct.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '6px 12px',
                              backgroundColor: '#ffffff',
                              border: '1px solid #fde68a',
                              borderRadius: 'var(--radius-sm)',
                            }}
                          >
                            <span>
                              <strong>{outAct.name}</strong> • Scheduled on {outAct.date}{' '}
                              {outAct.time && `(${formatTimeDisplay(outAct.time)})`}
                            </span>
                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                              <button
                                type="button"
                                className="ts-activity-action-btn"
                                onClick={() => handleOpenEditActivity(outAct)}
                              >
                                ✎ Move to Day
                              </button>
                              <button
                                type="button"
                                className="ts-activity-action-btn is-delete"
                                onClick={() => setDeletingActivity(outAct)}
                              >
                                ✕ Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB 3: BOOKINGS & TRAVEL DETAILS (Milestone 5 Functional Implementation) */}
          {(activeTab === 'bookings' || activeTab === 'places') && (
            <div className="ts-bookings-wrapper">
              {/* Header */}
              <div className="ts-budget-header">
                <div className="ts-budget-header-info">
                  <h2 className="ts-budget-title">Bookings &amp; Travel Details</h2>
                  <p className="ts-budget-subtitle">
                    Keep hotel confirmations, flight PNRs, transit details, and reservations
                    organized for <strong>{trip.name}</strong>.
                  </p>
                </div>
                <Button variant="primary" size="sm" onClick={() => handleOpenAddBooking('accommodation')}>
                  + Add Booking
                </Button>
              </div>

              {/* 4 Metric Cards */}
              <div className="ts-workspace-stats-grid">
                <div className="ts-stat-card">
                  <span className="ts-stat-label">Total Bookings</span>
                  <span className="ts-stat-value">{allBookings.length}</span>
                  <span className="ts-stat-desc">Confirmed travel records</span>
                </div>

                <div className="ts-stat-card">
                  <span className="ts-stat-label">Accommodation</span>
                  <span className="ts-stat-value">{accommodationCount}</span>
                  <span className="ts-stat-desc">
                    {accommodationCount === 1 ? '1 lodging reserved' : `${accommodationCount} lodgings reserved`}
                  </span>
                </div>

                <div className="ts-stat-card">
                  <span className="ts-stat-label">Transport</span>
                  <span className="ts-stat-value">{transportCount}</span>
                  <span className="ts-stat-desc">
                    {transportCount === 1 ? '1 transit record' : `${transportCount} transit records`}
                  </span>
                </div>

                <div className="ts-stat-card">
                  <span className="ts-stat-label">Activities &amp; Reservations</span>
                  <span className="ts-stat-value">{activityCount}</span>
                  <span className="ts-stat-desc">
                    {activityCount === 1 ? '1 activity booked' : `${activityCount} activities booked`}
                  </span>
                </div>
              </div>

              {/* Bookings Management Section */}
              <div className="ts-expenses-section">
                <div className="ts-expenses-header-row">
                  <div className="ts-expenses-title-group">
                    <h3 className="ts-expenses-section-title">
                      Travel Records ({allBookings.length})
                    </h3>
                  </div>

                  <div className="ts-expenses-controls">
                    <div className="ts-category-filter-wrap">
                      <label htmlFor="booking-category-filter" className="ts-filter-label">
                        Category:
                      </label>
                      <select
                        id="booking-category-filter"
                        value={bookingFilter}
                        onChange={(e) => setBookingFilter(e.target.value)}
                        className="ts-filter-select"
                      >
                        <option value="all">All Categories ({allBookings.length})</option>
                        <option value="accommodation">Accommodation ({accommodationCount})</option>
                        <option value="transport">Transport ({transportCount})</option>
                        <option value="activity">Activities &amp; Reservations ({activityCount})</option>
                      </select>
                    </div>

                    <Button variant="primary" size="sm" onClick={() => handleOpenAddBooking('accommodation')}>
                      + Add Booking
                    </Button>
                  </div>
                </div>

                {allBookings.length === 0 ? (
                  <div className="ts-itinerary-empty-card">
                    <div className="ts-itinerary-empty-icon">🎫</div>
                    <h3 className="ts-itinerary-empty-title">No bookings recorded yet</h3>
                    <p className="ts-itinerary-empty-desc">
                      Store hotel confirmations, flight numbers, train tickets, and activity
                      reservations for {trip.name} so your logistics are organized in one place.
                    </p>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => handleOpenAddBooking('accommodation')}
                      >
                        + Add Stay / Hotel
                      </Button>
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => handleOpenAddBooking('transport')}
                      >
                        + Add Transport
                      </Button>
                    </div>
                  </div>
                ) : filteredBookings.length === 0 ? (
                  <div className="ts-itinerary-empty-card" style={{ padding: 'var(--space-8)' }}>
                    <h3 className="ts-itinerary-empty-title">No bookings found</h3>
                    <p className="ts-itinerary-empty-desc">
                      No records found under the selected category.
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setBookingFilter('all')}
                    >
                      Show All Bookings
                    </Button>
                  </div>
                ) : (
                  <div className="ts-bookings-list">
                    {filteredBookings.map((bk) => {
                      const cat = (bk.category || '').toLowerCase().trim() ||
                        (bk.transportType ? 'transport' : bk.reservationDateTime ? 'activity' : 'accommodation')
                      const isAccom = cat === 'accommodation'
                      const isTrans = cat === 'transport'
                      const isAct = cat === 'activity'

                      let categoryLabel = 'Accommodation'
                      if (isTrans) categoryLabel = `Transport — ${bk.transportType || 'Transit'}`
                      if (isAct) categoryLabel = 'Activity & Reservation'

                      const primaryTitle = isTrans
                        ? (bk.name || `${bk.transportType || 'Transport'}${bk.operator ? ' • ' + bk.operator : ''}`)
                        : (bk.name || bk.propertyName || (isAccom ? 'Accommodation' : 'Activity'))

                      const refCode = (bk.bookingRef || bk.reference || '').trim()
                      const location = (bk.location || bk.address || '').trim()
                      const contactPhone = (bk.contactNumber || bk.contact || '').trim()
                      const contactInfo = (bk.contactInfo || bk.contact || '').trim()

                      return (
                        <article key={bk.id} className="ts-booking-card">
                          <div className="ts-booking-card-header">
                            <div className="ts-booking-header-left">
                              <span className={`ts-booking-badge is-${cat}`}>
                                {categoryLabel}
                              </span>
                              <h4 className="ts-booking-title">{primaryTitle}</h4>
                              {refCode && (
                                <span className="ts-booking-ref-pill">
                                  {isTrans ? `PNR / Ref: ${refCode}` : `Ref: ${refCode}`}
                                </span>
                              )}
                            </div>

                            <div className="ts-booking-actions">
                              <button
                                type="button"
                                className="ts-activity-action-btn"
                                onClick={() => handleOpenEditBooking(bk)}
                                aria-label={`Edit ${primaryTitle}`}
                              >
                                ✎ Edit
                              </button>
                              <button
                                type="button"
                                className="ts-activity-action-btn is-delete"
                                onClick={() => setDeletingBooking(bk)}
                                aria-label={`Delete ${primaryTitle}`}
                              >
                                ✕ Delete
                              </button>
                            </div>
                          </div>

                          <div className="ts-booking-details-grid">
                            {/* Accommodation details */}
                            {isAccom && (
                              <>
                                {(bk.checkInDate || bk.checkOutDate) && (
                                  <div className="ts-booking-detail-item">
                                    <span className="ts-booking-detail-label">Check-in / Check-out</span>
                                    <span className="ts-booking-detail-val">
                                      {bk.checkInDate ? formatBookingDate(bk.checkInDate) : 'Not set'}
                                      {' → '}
                                      {bk.checkOutDate ? formatBookingDate(bk.checkOutDate) : 'Not set'}
                                    </span>
                                  </div>
                                )}
                                {location && (
                                  <div className="ts-booking-detail-item">
                                    <span className="ts-booking-detail-label">Address</span>
                                    <span className="ts-booking-detail-val">{location}</span>
                                  </div>
                                )}
                                {contactPhone && (
                                  <div className="ts-booking-detail-item">
                                    <span className="ts-booking-detail-label">Phone</span>
                                    <span className="ts-booking-detail-val">{contactPhone}</span>
                                  </div>
                                )}
                              </>
                            )}

                            {/* Transport details */}
                            {isTrans && (
                              <>
                                {bk.operator && (
                                  <div className="ts-booking-detail-item">
                                    <span className="ts-booking-detail-label">Carrier / Operator</span>
                                    <span className="ts-booking-detail-val">{bk.operator}</span>
                                  </div>
                                )}
                                {(bk.departureLocation || bk.departureDateTime) && (
                                  <div className="ts-booking-detail-item">
                                    <span className="ts-booking-detail-label">Departure</span>
                                    <span className="ts-booking-detail-val">
                                      {bk.departureLocation || 'Departure location not set'}
                                      {bk.departureDateTime ? ` • ${formatBookingDate(bk.departureDateTime)}` : ''}
                                    </span>
                                  </div>
                                )}
                                {(bk.arrivalLocation || bk.arrivalDateTime) && (
                                  <div className="ts-booking-detail-item">
                                    <span className="ts-booking-detail-label">Arrival</span>
                                    <span className="ts-booking-detail-val">
                                      {bk.arrivalLocation || 'Arrival location not set'}
                                      {bk.arrivalDateTime ? ` • ${formatBookingDate(bk.arrivalDateTime)}` : ''}
                                    </span>
                                  </div>
                                )}
                              </>
                            )}

                            {/* Activity details */}
                            {isAct && (
                              <>
                                {bk.reservationDateTime && (
                                  <div className="ts-booking-detail-item">
                                    <span className="ts-booking-detail-label">Reservation Date &amp; Time</span>
                                    <span className="ts-booking-detail-val">
                                      {formatBookingDate(bk.reservationDateTime)}
                                    </span>
                                  </div>
                                )}
                                {location && (
                                  <div className="ts-booking-detail-item">
                                    <span className="ts-booking-detail-label">Meeting Point / Location</span>
                                    <span className="ts-booking-detail-val">{location}</span>
                                  </div>
                                )}
                                {contactInfo && (
                                  <div className="ts-booking-detail-item">
                                    <span className="ts-booking-detail-label">Contact Information</span>
                                    <span className="ts-booking-detail-val">{contactInfo}</span>
                                  </div>
                                )}
                              </>
                            )}
                          </div>

                          {bk.notes && (
                            <div className="ts-booking-notes-box">
                              <span className="ts-booking-notes-text">{bk.notes}</span>
                            </div>
                          )}
                        </article>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: BUDGET & EXPENSES (Milestone 4 Functional Implementation) */}
          {activeTab === 'budget' && (
            <div className="ts-budget-wrapper">
              {/* Header */}
              <div className="ts-budget-header">
                <div className="ts-budget-header-info">
                  <h2 className="ts-budget-title">Trip Budget &amp; Expenses</h2>
                  <p className="ts-budget-subtitle">
                    Track actual expenses against your total estimated budget of{' '}
                    <strong>{formatINR(trip.budget)}</strong> for <strong>{trip.name}</strong>.
                  </p>
                </div>
                <Button variant="primary" size="sm" onClick={handleOpenAddExpense}>
                  + Add Expense
                </Button>
              </div>

              {/* 4 Metric Cards */}
              <div className="ts-workspace-stats-grid">
                <div className="ts-stat-card">
                  <span className="ts-stat-label">Total Trip Budget</span>
                  <span className="ts-stat-value">{formatINR(trip.budget)}</span>
                  <span className="ts-stat-desc">Allocated spending limit</span>
                </div>

                <div className="ts-stat-card">
                  <span className="ts-stat-label">Total Spent</span>
                  <span className="ts-stat-value">{formatINR(totalSpent)}</span>
                  <span className="ts-stat-desc">
                    {allExpenses.length} {allExpenses.length === 1 ? 'expense' : 'expenses'} recorded
                  </span>
                </div>

                <div className="ts-stat-card">
                  <span className="ts-stat-label">Remaining Budget</span>
                  <span
                    className="ts-stat-value"
                    style={{
                      color: budgetUsage.isOverBudget ? 'var(--color-error)' : 'inherit',
                    }}
                  >
                    {budgetUsage.isOverBudget
                      ? `-₹${budgetUsage.overspentAmount.toLocaleString('en-IN')}`
                      : formatINR(remainingBudget)}
                  </span>
                  <span
                    className="ts-stat-desc"
                    style={{
                      color: budgetUsage.isOverBudget ? 'var(--color-error)' : 'inherit',
                      fontWeight: budgetUsage.isOverBudget ? 600 : 'normal',
                    }}
                  >
                    {budgetUsage.isOverBudget
                      ? `⚠️ Over budget by ₹${budgetUsage.overspentAmount.toLocaleString('en-IN')}`
                      : `${Math.max(0, 100 - budgetUsage.percentage)}% of budget remaining`}
                  </span>
                </div>

                <div className="ts-stat-card">
                  <span className="ts-stat-label">Budget Usage</span>
                  <span
                    className="ts-stat-value"
                    style={{
                      color: budgetUsage.isOverBudget ? 'var(--color-error)' : 'inherit',
                    }}
                  >
                    {budgetUsage.percentage}%
                  </span>
                  <span className="ts-stat-desc">
                    {budgetUsage.isOverBudget
                      ? `Exceeded by ${budgetUsage.percentage - 100}%`
                      : averagePerTraveler !== null
                      ? `${formatINR(averagePerTraveler)}/traveler avg`
                      : 'Within estimated limit'}
                  </span>
                </div>
              </div>

              {/* Budget Consumption Progress Bar */}
              <div className="ts-budget-progress-card">
                <div className="ts-budget-progress-header">
                  <span className="ts-progress-title">Budget Consumption</span>
                  <span className="ts-progress-stats">
                    <strong>{formatINR(totalSpent)}</strong> spent of{' '}
                    <strong>{formatINR(trip.budget)}</strong> ({budgetUsage.percentage}%)
                  </span>
                </div>
                <div
                  className="ts-budget-progress-track"
                  role="progressbar"
                  aria-valuenow={budgetUsage.percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className={`ts-budget-progress-fill ${
                      budgetUsage.isOverBudget
                        ? 'is-danger'
                        : budgetUsage.percentage >= 80
                        ? 'is-warning'
                        : 'is-normal'
                    }`}
                    style={{ width: `${budgetUsage.progressPercent}%` }}
                  />
                </div>
                {budgetUsage.isOverBudget && (
                  <div className="ts-budget-overspent-banner" role="alert">
                    <span>
                      ⚠️ <strong>Budget Exceeded:</strong> You have overspent by{' '}
                      {formatINR(budgetUsage.overspentAmount)}. Total expenses are{' '}
                      {budgetUsage.percentage}% of your planned {formatINR(trip.budget)} budget.
                    </span>
                  </div>
                )}
              </div>

              {/* Spending by Category Breakdown */}
              <div className="ts-content-card">
                <h3 className="ts-content-card-title">Spending by Category</h3>
                {allExpenses.length === 0 ? (
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-subtle)', margin: 0 }}>
                    Category breakdowns will automatically calculate as you log expenses.
                  </p>
                ) : (
                  <div className="ts-category-breakdown-grid">
                    {categoryBreakdown.map((cat) => (
                      <div key={cat.id} className="ts-category-breakdown-item">
                        <div className="ts-category-top-info">
                          <span className="ts-category-label">
                            {cat.icon} {cat.label}
                          </span>
                          <span className="ts-category-amount">{formatINR(cat.total)}</span>
                        </div>
                        <div className="ts-category-progress-track">
                          <div
                            className="ts-category-progress-fill"
                            style={{ width: `${cat.percentage}%` }}
                          />
                        </div>
                        <span className="ts-category-subtext">
                          {cat.percentage}% of spending ({cat.count}{' '}
                          {cat.count === 1 ? 'item' : 'items'})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Expenses Management Section */}
              <div className="ts-expenses-section">
                <div className="ts-expenses-header-row">
                  <div className="ts-expenses-title-group">
                    <h3 className="ts-expenses-section-title">
                      Recorded Expenses ({allExpenses.length})
                    </h3>
                  </div>

                  <div className="ts-expenses-controls">
                    <div className="ts-category-filter-wrap">
                      <label htmlFor="category-filter" className="ts-filter-label">
                        Category:
                      </label>
                      <select
                        id="category-filter"
                        value={expenseFilter}
                        onChange={(e) => setExpenseFilter(e.target.value)}
                        className="ts-filter-select"
                      >
                        <option value="all">All Categories ({allExpenses.length})</option>
                        {EXPENSE_CATEGORIES.map((cat) => {
                          const count = allExpenses.filter(
                            (e) => (e.category || '').toLowerCase() === cat.id.toLowerCase()
                          ).length
                          return (
                            <option key={cat.id} value={cat.id}>
                              {cat.icon} {cat.label} ({count})
                            </option>
                          )
                        })}
                      </select>
                    </div>

                    <Button variant="primary" size="sm" onClick={handleOpenAddExpense}>
                      + Add Expense
                    </Button>
                  </div>
                </div>

                {allExpenses.length === 0 ? (
                  <div className="ts-itinerary-empty-card">
                    <div className="ts-itinerary-empty-icon">🧾</div>
                    <h3 className="ts-itinerary-empty-title">No expenses recorded yet</h3>
                    <p className="ts-itinerary-empty-desc">
                      Keep track of travel costs, lodging, dining, and activities for {trip.name}{' '}
                      to stay within your {formatINR(trip.budget)} budget.
                    </p>
                    <Button variant="primary" size="md" onClick={handleOpenAddExpense}>
                      + Add First Expense
                    </Button>
                  </div>
                ) : filteredExpenses.length === 0 ? (
                  <div className="ts-itinerary-empty-card" style={{ padding: 'var(--space-8)' }}>
                    <h3 className="ts-itinerary-empty-title">No expenses found</h3>
                    <p className="ts-itinerary-empty-desc">
                      No expenses recorded under the &ldquo;{expenseFilter}&rdquo; category.
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setExpenseFilter('all')}
                    >
                      Show All Expenses
                    </Button>
                  </div>
                ) : (
                  <div className="ts-expenses-list">
                    {filteredExpenses.map((expense) => {
                      const catMeta = EXPENSE_CATEGORIES.find(
                        (c) => c.id.toLowerCase() === (expense.category || '').toLowerCase()
                      ) || {
                        icon: '📦',
                        label: expense.category || 'Other',
                      }

                      return (
                        <article key={expense.id} className="ts-expense-card">
                          <div className="ts-expense-left">
                            <div className="ts-expense-title-row">
                              <span className="ts-category-pill">
                                {catMeta.icon} {catMeta.label}
                              </span>
                              <h4 className="ts-expense-title">{expense.title}</h4>
                            </div>
                            <div className="ts-expense-meta-info">
                              <span className="ts-expense-date">
                                🗓️ {formatExpenseDate(expense.date)}
                              </span>
                              {expense.notes && (
                                <span className="ts-expense-notes-preview">
                                  💬 {expense.notes}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="ts-expense-right">
                            <span className="ts-expense-amount">
                              {formatINR(expense.amount)}
                            </span>
                            <div className="ts-expense-actions">
                              <button
                                type="button"
                                className="ts-activity-action-btn"
                                onClick={() => handleOpenEditExpense(expense)}
                                aria-label={`Edit ${expense.title}`}
                              >
                                ✎ Edit
                              </button>
                              <button
                                type="button"
                                className="ts-activity-action-btn is-delete"
                                onClick={() => setDeletingExpense(expense)}
                                aria-label={`Delete ${expense.title}`}
                              >
                                ✕ Delete
                              </button>
                            </div>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </PageContainer>
      </main>

      {/* ADD ACTIVITY MODAL */}
      {isAddActivityOpen && (
        <div className="ts-modal-overlay" role="dialog" aria-modal="true">
          <div className="ts-modal-box">
            <h2 className="ts-modal-title">
              Add Activity — Day {activeDay?.dayNumber}
            </h2>
            <p className="ts-modal-desc">
              Schedule an activity for {activeDay?.formattedDate} ({activeDay?.dayOfWeek}).
            </p>

            {actError && (
              <div className="ts-general-error" role="alert">
                {actError}
              </div>
            )}

            <form
              onSubmit={(e) => handleSubmitAddActivity(e, activeDate)}
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
            >
              <div className="ts-form-group">
                <label htmlFor="act-name" className="ts-label">
                  Activity Name *
                </label>
                <input
                  id="act-name"
                  type="text"
                  placeholder="e.g. Sunrise view at Tiger Hill, Beach sunset stroll"
                  value={actName}
                  onChange={(e) => {
                    setActName(e.target.value)
                    if (actError) setActError(null)
                  }}
                  className={`ts-input-field ${actError ? 'has-error' : ''}`}
                />
              </div>

              <div className="ts-form-grid-2">
                <div className="ts-form-group">
                  <label htmlFor="act-time" className="ts-label">
                    Time (Optional)
                  </label>
                  <input
                    id="act-time"
                    type="time"
                    value={actTime}
                    onChange={(e) => setActTime(e.target.value)}
                    className="ts-input-field"
                  />
                  <span className="ts-input-helper">Leave empty for flexible timing</span>
                </div>

                <div className="ts-form-group">
                  <label htmlFor="act-location" className="ts-label">
                    Place or Location (Optional)
                  </label>
                  <input
                    id="act-location"
                    type="text"
                    placeholder="e.g. Fort Aguada, Candolim"
                    value={actLocation}
                    onChange={(e) => setActLocation(e.target.value)}
                    className="ts-input-field"
                  />
                </div>
              </div>

              <div className="ts-form-group">
                <label htmlFor="act-notes" className="ts-label">
                  Notes (Optional)
                </label>
                <textarea
                  id="act-notes"
                  rows={3}
                  placeholder="e.g. Tickets booked online. Bring identification and comfortable shoes."
                  value={actNotes}
                  onChange={(e) => setActNotes(e.target.value)}
                  className="ts-input-field"
                />
              </div>

              <div className="ts-modal-actions">
                <Button
                  variant="secondary"
                  size="md"
                  type="button"
                  onClick={() => setIsAddActivityOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="md" type="submit">
                  + Add to Itinerary
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ACTIVITY MODAL */}
      {editingActivity && (
        <div className="ts-modal-overlay" role="dialog" aria-modal="true">
          <div className="ts-modal-box">
            <h2 className="ts-modal-title">Edit Activity</h2>
            <p className="ts-modal-desc">
              Modify details, schedule, or assigned day for this activity.
            </p>

            {editActError && (
              <div className="ts-general-error" role="alert">
                {editActError}
              </div>
            )}

            <form
              onSubmit={handleSubmitEditActivity}
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
            >
              <div className="ts-form-group">
                <label htmlFor="edit-act-name" className="ts-label">
                  Activity Name *
                </label>
                <input
                  id="edit-act-name"
                  type="text"
                  value={editActName}
                  onChange={(e) => {
                    setEditActName(e.target.value)
                    if (editActError) setEditActError(null)
                  }}
                  className={`ts-input-field ${editActError ? 'has-error' : ''}`}
                />
              </div>

              <div className="ts-form-grid-2">
                <div className="ts-form-group">
                  <label htmlFor="edit-act-date" className="ts-label">
                    Trip Day / Date *
                  </label>
                  <select
                    id="edit-act-date"
                    value={editActDate}
                    onChange={(e) => setEditActDate(e.target.value)}
                    className="ts-input-field"
                  >
                    {days.map((d) => (
                      <option key={d.dateString} value={d.dateString}>
                        {d.label} ({d.dayOfWeek})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ts-form-group">
                  <label htmlFor="edit-act-time" className="ts-label">
                    Time (Optional)
                  </label>
                  <input
                    id="edit-act-time"
                    type="time"
                    value={editActTime}
                    onChange={(e) => setEditActTime(e.target.value)}
                    className="ts-input-field"
                  />
                </div>
              </div>

              <div className="ts-form-group">
                <label htmlFor="edit-act-location" className="ts-label">
                  Place or Location (Optional)
                </label>
                <input
                  id="edit-act-location"
                  type="text"
                  value={editActLocation}
                  onChange={(e) => setEditActLocation(e.target.value)}
                  className="ts-input-field"
                />
              </div>

              <div className="ts-form-group">
                <label htmlFor="edit-act-notes" className="ts-label">
                  Notes (Optional)
                </label>
                <textarea
                  id="edit-act-notes"
                  rows={3}
                  value={editActNotes}
                  onChange={(e) => setEditActNotes(e.target.value)}
                  className="ts-input-field"
                />
              </div>

              <div className="ts-modal-actions">
                <Button
                  variant="secondary"
                  size="md"
                  type="button"
                  onClick={() => setEditingActivity(null)}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="md" type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE ACTIVITY CONFIRMATION MODAL */}
      {deletingActivity && (
        <div className="ts-modal-overlay" role="dialog" aria-modal="true">
          <div className="ts-modal-box" style={{ maxWidth: '480px' }}>
            <h2 className="ts-modal-title" style={{ color: 'var(--color-error)' }}>
              Delete Activity?
            </h2>
            <p className="ts-modal-desc">
              Are you sure you want to remove <strong>&ldquo;{deletingActivity.name}&rdquo;</strong>{' '}
              from your itinerary? This action cannot be undone.
            </p>

            <div className="ts-modal-actions">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setDeletingActivity(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleConfirmDeleteActivity}
                style={{
                  backgroundColor: 'var(--color-error)',
                  borderColor: 'var(--color-error)',
                }}
              >
                Delete Activity
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT TRIP MODAL */}
      {isEditingTrip && (
        <div className="ts-modal-overlay" role="dialog" aria-modal="true">
          <div className="ts-modal-box">
            <h2 className="ts-modal-title">Edit Trip Details</h2>
            <p className="ts-modal-desc">
              Modify destination, travel companions, schedule, budget, or notes for {trip.name}.
            </p>

            {editTripErrors.form && (
              <div className="ts-general-error" role="alert">
                {editTripErrors.form}
              </div>
            )}

            <form
              onSubmit={handleSaveEditTrip}
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
            >
              <div className="ts-form-group">
                <label htmlFor="edit-name" className="ts-label">
                  Trip Name *
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={editTripName}
                  onChange={(e) => setEditTripName(e.target.value)}
                  className={`ts-input-field ${editTripErrors.name ? 'has-error' : ''}`}
                />
                {editTripErrors.name && (
                  <span className="ts-field-error">{editTripErrors.name}</span>
                )}
              </div>

              <div className="ts-form-group">
                <label htmlFor="edit-destination" className="ts-label">
                  Destination *
                </label>
                <input
                  id="edit-destination"
                  type="text"
                  value={editTripDestination}
                  onChange={(e) => setEditTripDestination(e.target.value)}
                  className={`ts-input-field ${editTripErrors.destination ? 'has-error' : ''}`}
                />
                {editTripErrors.destination && (
                  <span className="ts-field-error">{editTripErrors.destination}</span>
                )}
              </div>

              <div className="ts-form-grid-2">
                <div className="ts-form-group">
                  <label htmlFor="edit-start" className="ts-label">
                    Start Date *
                  </label>
                  <input
                    id="edit-start"
                    type="date"
                    value={editTripStartDate}
                    onChange={(e) => setEditTripStartDate(e.target.value)}
                    className={`ts-input-field ${editTripErrors.startDate ? 'has-error' : ''}`}
                  />
                  {editTripErrors.startDate && (
                    <span className="ts-field-error">{editTripErrors.startDate}</span>
                  )}
                </div>

                <div className="ts-form-group">
                  <label htmlFor="edit-end" className="ts-label">
                    End Date *
                  </label>
                  <input
                    id="edit-end"
                    type="date"
                    value={editTripEndDate}
                    min={editTripStartDate || undefined}
                    onChange={(e) => setEditTripEndDate(e.target.value)}
                    className={`ts-input-field ${editTripErrors.endDate ? 'has-error' : ''}`}
                  />
                  {editTripErrors.endDate && (
                    <span className="ts-field-error">{editTripErrors.endDate}</span>
                  )}
                </div>
              </div>

              {/* Travelers */}
              <div className="ts-form-group">
                <label htmlFor="edit-travelers" className="ts-label">
                  Number of Travelers (1–50) *
                </label>
                <div className="ts-travelers-picker">
                  <div className="ts-counter-control">
                    <button
                      type="button"
                      className="ts-counter-btn"
                      disabled={editTripTravelers <= 1}
                      onClick={() => setEditTripTravelers((prev) => Math.max(1, prev - 1))}
                    >
                      −
                    </button>
                    <input
                      id="edit-travelers"
                      type="number"
                      min="1"
                      max="50"
                      value={editTripTravelers}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10)
                        if (!isNaN(val)) {
                          setEditTripTravelers(Math.min(50, Math.max(1, val)))
                        }
                      }}
                      className="ts-counter-input"
                    />
                    <button
                      type="button"
                      className="ts-counter-btn"
                      disabled={editTripTravelers >= 50}
                      onClick={() => setEditTripTravelers((prev) => Math.min(50, prev + 1))}
                    >
                      +
                    </button>
                  </div>
                  <span className="ts-travelers-count-text">
                    {editTripTravelers === 1 ? '1 person' : `${editTripTravelers} people`}
                  </span>
                </div>
                {editTripErrors.travelers && (
                  <span className="ts-field-error">{editTripErrors.travelers}</span>
                )}
              </div>

              {/* Total Estimated Budget */}
              <div className="ts-form-group">
                <label htmlFor="edit-budget" className="ts-label">
                  Total Estimated Budget (₹) *
                </label>
                <div className="ts-currency-input-wrap">
                  <span className="ts-currency-symbol">₹</span>
                  <input
                    id="edit-budget"
                    type="number"
                    min="1"
                    placeholder="e.g. 50000"
                    value={editTripBudget}
                    onChange={(e) => setEditTripBudget(e.target.value)}
                    className={`ts-input-field with-currency ${editTripErrors.budget ? 'has-error' : ''}`}
                  />
                </div>
                <span className="ts-input-helper">
                  Total spending budget for the entire trip (not a per-person amount).
                </span>
                {editTripErrors.budget && (
                  <span className="ts-field-error">{editTripErrors.budget}</span>
                )}
              </div>

              {/* Notes */}
              <div className="ts-form-group">
                <label htmlFor="edit-notes" className="ts-label">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="edit-notes"
                  rows={3}
                  placeholder="e.g. Hotel details, flight references, or packing reminders..."
                  value={editTripNotes}
                  onChange={(e) => setEditTripNotes(e.target.value)}
                  className="ts-input-field"
                />
              </div>

              <div className="ts-modal-actions">
                <Button
                  variant="secondary"
                  size="md"
                  type="button"
                  onClick={() => setIsEditingTrip(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="md" type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE TRIP CONFIRMATION MODAL */}
      {isDeletingTrip && (
        <div className="ts-modal-overlay" role="dialog" aria-modal="true">
          <div className="ts-modal-box" style={{ maxWidth: '480px' }}>
            <h2 className="ts-modal-title" style={{ color: 'var(--color-error)' }}>
              Delete Trip?
            </h2>
            <p className="ts-modal-desc">
              Are you sure you want to delete <strong>{trip.name}</strong>? This action
              will permanently remove this journey and its workspace.
            </p>

            <div className="ts-modal-actions">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setIsDeletingTrip(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleConfirmDeleteTrip}
                style={{
                  backgroundColor: 'var(--color-error)',
                  borderColor: 'var(--color-error)',
                }}
              >
                Delete Trip
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ADD EXPENSE MODAL */}
      {isAddExpenseOpen && (
        <div className="ts-modal-overlay" role="dialog" aria-modal="true">
          <div className="ts-modal-box">
            <h2 className="ts-modal-title">Add Expense</h2>
            <p className="ts-modal-desc">
              Record a new expense for <strong>{trip.name}</strong>.
            </p>

            {expError && (
              <div className="ts-general-error" role="alert">
                {expError}
              </div>
            )}

            <form
              onSubmit={handleSubmitAddExpense}
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
            >
              <div className="ts-form-group">
                <label htmlFor="exp-title" className="ts-label">
                  Expense Title or Description *
                </label>
                <input
                  id="exp-title"
                  type="text"
                  placeholder="e.g. Flight to Goa, Taj Hotel stay, Seafood dinner"
                  value={expTitle}
                  onChange={(e) => {
                    setExpTitle(e.target.value)
                    if (expError) setExpError(null)
                  }}
                  className={`ts-input-field ${expError ? 'has-error' : ''}`}
                />
              </div>

              <div className="ts-form-grid-2">
                <div className="ts-form-group">
                  <label htmlFor="exp-amount" className="ts-label">
                    Amount (₹) *
                  </label>
                  <div className="ts-currency-input-wrap">
                    <span className="ts-currency-symbol">₹</span>
                    <input
                      id="exp-amount"
                      type="number"
                      min="1"
                      placeholder="e.g. 3500"
                      value={expAmount}
                      onChange={(e) => {
                        setExpAmount(e.target.value)
                        if (expError) setExpError(null)
                      }}
                      className="ts-input-field with-currency"
                    />
                  </div>
                </div>

                <div className="ts-form-group">
                  <label htmlFor="exp-category" className="ts-label">
                    Category *
                  </label>
                  <select
                    id="exp-category"
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value)}
                    className="ts-input-field"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="ts-form-group">
                <label htmlFor="exp-date" className="ts-label">
                  Expense Date *
                </label>
                <input
                  id="exp-date"
                  type="date"
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  className="ts-input-field"
                />
              </div>

              <div className="ts-form-group">
                <label htmlFor="exp-notes" className="ts-label">
                  Notes (Optional)
                </label>
                <textarea
                  id="exp-notes"
                  rows={3}
                  placeholder="e.g. Paid with credit card, split with travel companion, booking ref #54321"
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  className="ts-input-field"
                />
              </div>

              <div className="ts-modal-actions">
                <Button
                  variant="secondary"
                  size="md"
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="md" type="submit">
                  + Add Expense
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT EXPENSE MODAL */}
      {editingExpense && (
        <div className="ts-modal-overlay" role="dialog" aria-modal="true">
          <div className="ts-modal-box">
            <h2 className="ts-modal-title">Edit Expense</h2>
            <p className="ts-modal-desc">
              Modify details, category, or amount for this expense.
            </p>

            {editExpError && (
              <div className="ts-general-error" role="alert">
                {editExpError}
              </div>
            )}

            <form
              onSubmit={handleSubmitEditExpense}
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
            >
              <div className="ts-form-group">
                <label htmlFor="edit-exp-title" className="ts-label">
                  Expense Title or Description *
                </label>
                <input
                  id="edit-exp-title"
                  type="text"
                  value={editExpTitle}
                  onChange={(e) => {
                    setEditExpTitle(e.target.value)
                    if (editExpError) setEditExpError(null)
                  }}
                  className={`ts-input-field ${editExpError ? 'has-error' : ''}`}
                />
              </div>

              <div className="ts-form-grid-2">
                <div className="ts-form-group">
                  <label htmlFor="edit-exp-amount" className="ts-label">
                    Amount (₹) *
                  </label>
                  <div className="ts-currency-input-wrap">
                    <span className="ts-currency-symbol">₹</span>
                    <input
                      id="edit-exp-amount"
                      type="number"
                      min="1"
                      value={editExpAmount}
                      onChange={(e) => {
                        setEditExpAmount(e.target.value)
                        if (editExpError) setEditExpError(null)
                      }}
                      className="ts-input-field with-currency"
                    />
                  </div>
                </div>

                <div className="ts-form-group">
                  <label htmlFor="edit-exp-category" className="ts-label">
                    Category *
                  </label>
                  <select
                    id="edit-exp-category"
                    value={editExpCategory}
                    onChange={(e) => setEditExpCategory(e.target.value)}
                    className="ts-input-field"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="ts-form-group">
                <label htmlFor="edit-exp-date" className="ts-label">
                  Expense Date *
                </label>
                <input
                  id="edit-exp-date"
                  type="date"
                  value={editExpDate}
                  onChange={(e) => setEditExpDate(e.target.value)}
                  className="ts-input-field"
                />
              </div>

              <div className="ts-form-group">
                <label htmlFor="edit-exp-notes" className="ts-label">
                  Notes (Optional)
                </label>
                <textarea
                  id="edit-exp-notes"
                  rows={3}
                  value={editExpNotes}
                  onChange={(e) => setEditExpNotes(e.target.value)}
                  className="ts-input-field"
                />
              </div>

              <div className="ts-modal-actions">
                <Button
                  variant="secondary"
                  size="md"
                  type="button"
                  onClick={() => setEditingExpense(null)}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="md" type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE EXPENSE CONFIRMATION MODAL */}
      {deletingExpense && (
        <div className="ts-modal-overlay" role="dialog" aria-modal="true">
          <div className="ts-modal-box" style={{ maxWidth: '480px' }}>
            <h2 className="ts-modal-title" style={{ color: 'var(--color-error)' }}>
              Delete Expense?
            </h2>
            <p className="ts-modal-desc">
              Are you sure you want to remove <strong>&ldquo;{deletingExpense.title}&rdquo;</strong>{' '}
              ({formatINR(deletingExpense.amount)}) from this trip? This action cannot be undone.
            </p>

            <div className="ts-modal-actions">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setDeletingExpense(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleConfirmDeleteExpense}
                style={{
                  backgroundColor: 'var(--color-error)',
                  borderColor: 'var(--color-error)',
                }}
              >
                Delete Expense
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ADD BOOKING MODAL */}
      {isAddBookingOpen && (
        <div className="ts-modal-overlay" role="dialog" aria-modal="true">
          <div className="ts-modal-box">
            <h2 className="ts-modal-title">Add Booking or Travel Detail</h2>
            <p className="ts-modal-desc">
              Record reservation and logistics details for <strong>{trip.name}</strong>.
            </p>

            {/* Category Selector Tabs */}
            <div className="ts-category-switcher" role="tablist">
              {BOOKING_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={bkCategory === cat.id}
                  className={`ts-category-switch-btn ${bkCategory === cat.id ? 'is-active' : ''}`}
                  onClick={() => {
                    setBkCategory(cat.id)
                    setBkError(null)
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {bkError && (
              <div className="ts-general-error" role="alert">
                {bkError}
              </div>
            )}

            <form
              onSubmit={handleSubmitAddBooking}
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
            >
              {/* ACCOMMODATION FIELDS */}
              {bkCategory === 'accommodation' && (
                <>
                  <div className="ts-form-group">
                    <label htmlFor="bk-name" className="ts-label">
                      Property or Hotel Name *
                    </label>
                    <input
                      id="bk-name"
                      type="text"
                      placeholder="e.g. Taj Fort Aguada Resort, Hyatt Regency, Sea View Villa"
                      value={bkName}
                      onChange={(e) => {
                        setBkName(e.target.value)
                        if (bkError) setBkError(null)
                      }}
                      className="ts-input-field"
                    />
                  </div>

                  <div className="ts-form-group">
                    <label htmlFor="bk-location" className="ts-label">
                      Address or Location *
                    </label>
                    <input
                      id="bk-location"
                      type="text"
                      placeholder="e.g. Sinquerim Beach, Candolim, North Goa"
                      value={bkLocation}
                      onChange={(e) => {
                        setBkLocation(e.target.value)
                        if (bkError) setBkError(null)
                      }}
                      className="ts-input-field"
                    />
                  </div>

                  <div className="ts-form-grid-2">
                    <div className="ts-form-group">
                      <label htmlFor="bk-checkin" className="ts-label">
                        Check-in Date *
                      </label>
                      <input
                        id="bk-checkin"
                        type="date"
                        value={bkCheckInDate}
                        onChange={(e) => {
                          setBkCheckInDate(e.target.value)
                          if (bkError) setBkError(null)
                        }}
                        className="ts-input-field"
                      />
                    </div>

                    <div className="ts-form-group">
                      <label htmlFor="bk-checkout" className="ts-label">
                        Check-out Date *
                      </label>
                      <input
                        id="bk-checkout"
                        type="date"
                        min={bkCheckInDate || undefined}
                        value={bkCheckOutDate}
                        onChange={(e) => {
                          setBkCheckOutDate(e.target.value)
                          if (bkError) setBkError(null)
                        }}
                        className="ts-input-field"
                      />
                    </div>
                  </div>

                  <div className="ts-form-grid-2">
                    <div className="ts-form-group">
                      <label htmlFor="bk-ref" className="ts-label">
                        Booking Reference / Confirmation Code (Optional)
                      </label>
                      <input
                        id="bk-ref"
                        type="text"
                        placeholder="e.g. TAJ-98234-X, BKG-5542"
                        value={bkBookingRef}
                        onChange={(e) => setBkBookingRef(e.target.value)}
                        className="ts-input-field"
                      />
                    </div>

                    <div className="ts-form-group">
                      <label htmlFor="bk-contact" className="ts-label">
                        Contact Number (Optional)
                      </label>
                      <input
                        id="bk-contact"
                        type="text"
                        placeholder="e.g. +91 832 664 5858"
                        value={bkContactNumber}
                        onChange={(e) => setBkContactNumber(e.target.value)}
                        className="ts-input-field"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* TRANSPORT FIELDS */}
              {bkCategory === 'transport' && (
                <>
                  <div className="ts-form-grid-2">
                    <div className="ts-form-group">
                      <label htmlFor="bk-trans-type" className="ts-label">
                        Transport Type *
                      </label>
                      <select
                        id="bk-trans-type"
                        value={bkTransportType}
                        onChange={(e) => {
                          setBkTransportType(e.target.value)
                          if (bkError) setBkError(null)
                        }}
                        className="ts-input-field"
                      >
                        {TRANSPORT_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="ts-form-group">
                      <label htmlFor="bk-operator" className="ts-label">
                        Operator / Carrier *
                      </label>
                      <input
                        id="bk-operator"
                        type="text"
                        placeholder="e.g. IndiGo 6E-204, Vande Bharat Express, Zoomcar"
                        value={bkOperator}
                        onChange={(e) => {
                          setBkOperator(e.target.value)
                          if (bkError) setBkError(null)
                        }}
                        className="ts-input-field"
                      />
                    </div>
                  </div>

                  <div className="ts-form-group">
                    <label htmlFor="bk-trans-ref" className="ts-label">
                      Booking Reference or PNR *
                    </label>
                    <input
                      id="bk-trans-ref"
                      type="text"
                      placeholder="e.g. PNR: 8492049102, Ticket #33201"
                      value={bkBookingRef}
                      onChange={(e) => {
                        setBkBookingRef(e.target.value)
                        if (bkError) setBkError(null)
                      }}
                      className="ts-input-field"
                    />
                  </div>

                  <div className="ts-form-grid-2">
                    <div className="ts-form-group">
                      <label htmlFor="bk-departure-loc" className="ts-label">
                        Departure Location *
                      </label>
                      <input
                        id="bk-departure-loc"
                        type="text"
                        placeholder="e.g. Delhi (DEL) Terminal 3"
                        value={bkDepartureLocation}
                        onChange={(e) => {
                          setBkDepartureLocation(e.target.value)
                          if (bkError) setBkError(null)
                        }}
                        className="ts-input-field"
                      />
                    </div>

                    <div className="ts-form-group">
                      <label htmlFor="bk-arrival-loc" className="ts-label">
                        Arrival Location *
                      </label>
                      <input
                        id="bk-arrival-loc"
                        type="text"
                        placeholder="e.g. Goa (GOI) Dabolim Airport"
                        value={bkArrivalLocation}
                        onChange={(e) => {
                          setBkArrivalLocation(e.target.value)
                          if (bkError) setBkError(null)
                        }}
                        className="ts-input-field"
                      />
                    </div>
                  </div>

                  <div className="ts-form-grid-2">
                    <div className="ts-form-group">
                      <label htmlFor="bk-departure-dt" className="ts-label">
                        Departure Date &amp; Time *
                      </label>
                      <input
                        id="bk-departure-dt"
                        type="datetime-local"
                        value={bkDepartureDateTime}
                        onChange={(e) => {
                          setBkDepartureDateTime(e.target.value)
                          if (bkError) setBkError(null)
                        }}
                        className="ts-input-field"
                      />
                    </div>

                    <div className="ts-form-group">
                      <label htmlFor="bk-arrival-dt" className="ts-label">
                        Arrival Date &amp; Time *
                      </label>
                      <input
                        id="bk-arrival-dt"
                        type="datetime-local"
                        min={bkDepartureDateTime || undefined}
                        value={bkArrivalDateTime}
                        onChange={(e) => {
                          setBkArrivalDateTime(e.target.value)
                          if (bkError) setBkError(null)
                        }}
                        className="ts-input-field"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* ACTIVITY FIELDS */}
              {bkCategory === 'activity' && (
                <>
                  <div className="ts-form-group">
                    <label htmlFor="bk-act-name" className="ts-label">
                      Booking or Activity Name *
                    </label>
                    <input
                      id="bk-act-name"
                      type="text"
                      placeholder="e.g. Scuba Diving at Grand Island, Heritage Walk, Museum Ticket"
                      value={bkName}
                      onChange={(e) => {
                        setBkName(e.target.value)
                        if (bkError) setBkError(null)
                      }}
                      className="ts-input-field"
                    />
                  </div>

                  <div className="ts-form-group">
                    <label htmlFor="bk-act-location" className="ts-label">
                      Location / Meeting Point (Optional)
                    </label>
                    <input
                      id="bk-act-location"
                      type="text"
                      placeholder="e.g. Sinquerim Jetty, Gate 2"
                      value={bkLocation}
                      onChange={(e) => setBkLocation(e.target.value)}
                      className="ts-input-field"
                    />
                  </div>

                  <div className="ts-form-grid-2">
                    <div className="ts-form-group">
                      <label htmlFor="bk-act-dt" className="ts-label">
                        Reservation Date &amp; Time *
                      </label>
                      <input
                        id="bk-act-dt"
                        type="datetime-local"
                        value={bkReservationDateTime}
                        onChange={(e) => {
                          setBkReservationDateTime(e.target.value)
                          if (bkError) setBkError(null)
                        }}
                        className="ts-input-field"
                      />
                    </div>

                    <div className="ts-form-group">
                      <label htmlFor="bk-act-ref" className="ts-label">
                        Booking Reference / Voucher # (Optional)
                      </label>
                      <input
                        id="bk-act-ref"
                        type="text"
                        placeholder="e.g. VCH-84920"
                        value={bkBookingRef}
                        onChange={(e) => setBkBookingRef(e.target.value)}
                        className="ts-input-field"
                      />
                    </div>
                  </div>

                  <div className="ts-form-group">
                    <label htmlFor="bk-act-contact" className="ts-label">
                      Contact Information (Optional)
                    </label>
                    <input
                      id="bk-act-contact"
                      type="text"
                      placeholder="e.g. Guide: Rajesh (+91 98221 44556)"
                      value={bkContactInfo}
                      onChange={(e) => setBkContactInfo(e.target.value)}
                      className="ts-input-field"
                    />
                  </div>
                </>
              )}

              {/* COMMON NOTES */}
              <div className="ts-form-group">
                <label htmlFor="bk-notes" className="ts-label">
                  Notes (Optional)
                </label>
                <textarea
                  id="bk-notes"
                  rows={3}
                  placeholder="e.g. Confirmation email received. Carry photo ID and original voucher."
                  value={bkNotes}
                  onChange={(e) => setBkNotes(e.target.value)}
                  className="ts-input-field"
                />
              </div>

              <div className="ts-modal-actions">
                <Button
                  variant="secondary"
                  size="md"
                  type="button"
                  onClick={() => setIsAddBookingOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="md" type="submit">
                  + Add Booking
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT BOOKING MODAL */}
      {editingBooking && (
        <div className="ts-modal-overlay" role="dialog" aria-modal="true">
          <div className="ts-modal-box">
            <h2 className="ts-modal-title">Edit Booking</h2>
            <p className="ts-modal-desc">
              Modify reservation details or practical information.
            </p>

            {editBkError && (
              <div className="ts-general-error" role="alert">
                {editBkError}
              </div>
            )}

            <form
              onSubmit={handleSubmitEditBooking}
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
            >
              {/* ACCOMMODATION EDIT FIELDS */}
              {editBkCategory === 'accommodation' && (
                <>
                  <div className="ts-form-group">
                    <label htmlFor="edit-bk-name" className="ts-label">
                      Property or Hotel Name *
                    </label>
                    <input
                      id="edit-bk-name"
                      type="text"
                      value={editBkName}
                      onChange={(e) => {
                        setEditBkName(e.target.value)
                        if (editBkError) setEditBkError(null)
                      }}
                      className="ts-input-field"
                    />
                  </div>

                  <div className="ts-form-group">
                    <label htmlFor="edit-bk-location" className="ts-label">
                      Address or Location *
                    </label>
                    <input
                      id="edit-bk-location"
                      type="text"
                      value={editBkLocation}
                      onChange={(e) => {
                        setEditBkLocation(e.target.value)
                        if (editBkError) setEditBkError(null)
                      }}
                      className="ts-input-field"
                    />
                  </div>

                  <div className="ts-form-grid-2">
                    <div className="ts-form-group">
                      <label htmlFor="edit-bk-checkin" className="ts-label">
                        Check-in Date *
                      </label>
                      <input
                        id="edit-bk-checkin"
                        type="date"
                        value={editBkCheckInDate}
                        onChange={(e) => {
                          setEditBkCheckInDate(e.target.value)
                          if (editBkError) setEditBkError(null)
                        }}
                        className="ts-input-field"
                      />
                    </div>

                    <div className="ts-form-group">
                      <label htmlFor="edit-bk-checkout" className="ts-label">
                        Check-out Date *
                      </label>
                      <input
                        id="edit-bk-checkout"
                        type="date"
                        min={editBkCheckInDate || undefined}
                        value={editBkCheckOutDate}
                        onChange={(e) => {
                          setEditBkCheckOutDate(e.target.value)
                          if (editBkError) setEditBkError(null)
                        }}
                        className="ts-input-field"
                      />
                    </div>
                  </div>

                  <div className="ts-form-grid-2">
                    <div className="ts-form-group">
                      <label htmlFor="edit-bk-ref" className="ts-label">
                        Booking Reference / Confirmation Code (Optional)
                      </label>
                      <input
                        id="edit-bk-ref"
                        type="text"
                        value={editBkBookingRef}
                        onChange={(e) => setEditBkBookingRef(e.target.value)}
                        className="ts-input-field"
                      />
                    </div>

                    <div className="ts-form-group">
                      <label htmlFor="edit-bk-contact" className="ts-label">
                        Contact Number (Optional)
                      </label>
                      <input
                        id="edit-bk-contact"
                        type="text"
                        value={editBkContactNumber}
                        onChange={(e) => setEditBkContactNumber(e.target.value)}
                        className="ts-input-field"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* TRANSPORT EDIT FIELDS */}
              {editBkCategory === 'transport' && (
                <>
                  <div className="ts-form-grid-2">
                    <div className="ts-form-group">
                      <label htmlFor="edit-bk-trans-type" className="ts-label">
                        Transport Type *
                      </label>
                      <select
                        id="edit-bk-trans-type"
                        value={editBkTransportType}
                        onChange={(e) => {
                          setEditBkTransportType(e.target.value)
                          if (editBkError) setEditBkError(null)
                        }}
                        className="ts-input-field"
                      >
                        {TRANSPORT_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="ts-form-group">
                      <label htmlFor="edit-bk-operator" className="ts-label">
                        Operator / Carrier *
                      </label>
                      <input
                        id="edit-bk-operator"
                        type="text"
                        value={editBkOperator}
                        onChange={(e) => {
                          setEditBkOperator(e.target.value)
                          if (editBkError) setEditBkError(null)
                        }}
                        className="ts-input-field"
                      />
                    </div>
                  </div>

                  <div className="ts-form-group">
                    <label htmlFor="edit-bk-trans-ref" className="ts-label">
                      Booking Reference or PNR *
                    </label>
                    <input
                      id="edit-bk-trans-ref"
                      type="text"
                      value={editBkBookingRef}
                      onChange={(e) => {
                        setEditBkBookingRef(e.target.value)
                        if (editBkError) setEditBkError(null)
                      }}
                      className="ts-input-field"
                    />
                  </div>

                  <div className="ts-form-grid-2">
                    <div className="ts-form-group">
                      <label htmlFor="edit-bk-departure-loc" className="ts-label">
                        Departure Location *
                      </label>
                      <input
                        id="edit-bk-departure-loc"
                        type="text"
                        value={editBkDepartureLocation}
                        onChange={(e) => {
                          setEditBkDepartureLocation(e.target.value)
                          if (editBkError) setEditBkError(null)
                        }}
                        className="ts-input-field"
                      />
                    </div>

                    <div className="ts-form-group">
                      <label htmlFor="edit-bk-arrival-loc" className="ts-label">
                        Arrival Location *
                      </label>
                      <input
                        id="edit-bk-arrival-loc"
                        type="text"
                        value={editBkArrivalLocation}
                        onChange={(e) => {
                          setEditBkArrivalLocation(e.target.value)
                          if (editBkError) setEditBkError(null)
                        }}
                        className="ts-input-field"
                      />
                    </div>
                  </div>

                  <div className="ts-form-grid-2">
                    <div className="ts-form-group">
                      <label htmlFor="edit-bk-departure-dt" className="ts-label">
                        Departure Date &amp; Time *
                      </label>
                      <input
                        id="edit-bk-departure-dt"
                        type="datetime-local"
                        value={editBkDepartureDateTime}
                        onChange={(e) => {
                          setEditBkDepartureDateTime(e.target.value)
                          if (editBkError) setEditBkError(null)
                        }}
                        className="ts-input-field"
                      />
                    </div>

                    <div className="ts-form-group">
                      <label htmlFor="edit-bk-arrival-dt" className="ts-label">
                        Arrival Date &amp; Time *
                      </label>
                      <input
                        id="edit-bk-arrival-dt"
                        type="datetime-local"
                        min={editBkDepartureDateTime || undefined}
                        value={editBkArrivalDateTime}
                        onChange={(e) => {
                          setEditBkArrivalDateTime(e.target.value)
                          if (editBkError) setEditBkError(null)
                        }}
                        className="ts-input-field"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* ACTIVITY EDIT FIELDS */}
              {editBkCategory === 'activity' && (
                <>
                  <div className="ts-form-group">
                    <label htmlFor="edit-bk-act-name" className="ts-label">
                      Booking or Activity Name *
                    </label>
                    <input
                      id="edit-bk-act-name"
                      type="text"
                      value={editBkName}
                      onChange={(e) => {
                        setEditBkName(e.target.value)
                        if (editBkError) setEditBkError(null)
                      }}
                      className="ts-input-field"
                    />
                  </div>

                  <div className="ts-form-group">
                    <label htmlFor="edit-bk-act-location" className="ts-label">
                      Location / Meeting Point (Optional)
                    </label>
                    <input
                      id="edit-bk-act-location"
                      type="text"
                      value={editBkLocation}
                      onChange={(e) => setEditBkLocation(e.target.value)}
                      className="ts-input-field"
                    />
                  </div>

                  <div className="ts-form-grid-2">
                    <div className="ts-form-group">
                      <label htmlFor="edit-bk-act-dt" className="ts-label">
                        Reservation Date &amp; Time *
                      </label>
                      <input
                        id="edit-bk-act-dt"
                        type="datetime-local"
                        value={editBkReservationDateTime}
                        onChange={(e) => {
                          setEditBkReservationDateTime(e.target.value)
                          if (editBkError) setEditBkError(null)
                        }}
                        className="ts-input-field"
                      />
                    </div>

                    <div className="ts-form-group">
                      <label htmlFor="edit-bk-act-ref" className="ts-label">
                        Booking Reference / Voucher # (Optional)
                      </label>
                      <input
                        id="edit-bk-act-ref"
                        type="text"
                        value={editBkBookingRef}
                        onChange={(e) => setEditBkBookingRef(e.target.value)}
                        className="ts-input-field"
                      />
                    </div>
                  </div>

                  <div className="ts-form-group">
                    <label htmlFor="edit-bk-act-contact" className="ts-label">
                      Contact Information (Optional)
                    </label>
                    <input
                      id="edit-bk-act-contact"
                      type="text"
                      value={editBkContactInfo}
                      onChange={(e) => setEditBkContactInfo(e.target.value)}
                      className="ts-input-field"
                    />
                  </div>
                </>
              )}

              {/* COMMON NOTES */}
              <div className="ts-form-group">
                <label htmlFor="edit-bk-notes" className="ts-label">
                  Notes (Optional)
                </label>
                <textarea
                  id="edit-bk-notes"
                  rows={3}
                  value={editBkNotes}
                  onChange={(e) => setEditBkNotes(e.target.value)}
                  className="ts-input-field"
                />
              </div>

              <div className="ts-modal-actions">
                <Button
                  variant="secondary"
                  size="md"
                  type="button"
                  onClick={() => setEditingBooking(null)}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="md" type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE BOOKING CONFIRMATION MODAL */}
      {deletingBooking && (
        <div className="ts-modal-overlay" role="dialog" aria-modal="true">
          <div className="ts-modal-box" style={{ maxWidth: '480px' }}>
            <h2 className="ts-modal-title" style={{ color: 'var(--color-error)' }}>
              Delete Booking?
            </h2>
            <p className="ts-modal-desc">
              Are you sure you want to remove{' '}
              <strong>
                &ldquo;
                {deletingBooking.category === 'transport'
                  ? `${deletingBooking.transportType}${deletingBooking.operator ? ' • ' + deletingBooking.operator : ''}`
                  : deletingBooking.name}
                &rdquo;
              </strong>{' '}
              from your travel records? This action cannot be undone.
            </p>

            <div className="ts-modal-actions">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setDeletingBooking(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleConfirmDeleteBooking}
                style={{
                  backgroundColor: 'var(--color-error)',
                  borderColor: 'var(--color-error)',
                }}
              >
                Delete Booking
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ADD TASK MODAL (Milestone 6) */}
      {isAddTaskOpen && (
        <div className="ts-modal-overlay" role="dialog" aria-modal="true">
          <div className="ts-modal-box">
            <h2 className="ts-modal-title">Add To-Do Task</h2>
            <p className="ts-modal-desc">
              Record a preparation task, packing item, or errand for <strong>{trip.name}</strong>.
            </p>

            {taskError && (
              <div className="ts-general-error" role="alert">
                {taskError}
              </div>
            )}

            <form
              onSubmit={handleSubmitAddTask}
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
            >
              <div className="ts-form-group">
                <label htmlFor="task-title" className="ts-label">
                  Task Title *
                </label>
                <input
                  id="task-title"
                  type="text"
                  placeholder="e.g. Check passport validity, Pack hiking boots, Apply for visa"
                  value={taskTitle}
                  onChange={(e) => {
                    setTaskTitle(e.target.value)
                    if (taskError) setTaskError(null)
                  }}
                  className={`ts-input-field ${taskError ? 'has-error' : ''}`}
                  autoFocus
                />
              </div>

              <div className="ts-form-group">
                <label htmlFor="task-due" className="ts-label">
                  Due Date (Optional)
                </label>
                <input
                  id="task-due"
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="ts-input-field"
                />
                <span className="ts-input-helper">
                  Can be before departure or during your trip dates ({trip.startDate} to {trip.endDate})
                </span>
              </div>

              <div className="ts-form-group">
                <label htmlFor="task-desc" className="ts-label">
                  Description / Notes (Optional)
                </label>
                <textarea
                  id="task-desc"
                  rows={3}
                  placeholder="e.g. Passport must have at least 6 months validity from return date."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="ts-input-field"
                />
              </div>

              <div className="ts-modal-actions">
                <Button
                  variant="secondary"
                  size="md"
                  type="button"
                  onClick={() => setIsAddTaskOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="md" type="submit">
                  + Add Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TASK MODAL (Milestone 6) */}
      {editingTask && (
        <div className="ts-modal-overlay" role="dialog" aria-modal="true">
          <div className="ts-modal-box">
            <h2 className="ts-modal-title">Edit Task</h2>
            <p className="ts-modal-desc">
              Update task title, due date, notes, or status.
            </p>

            {editTaskError && (
              <div className="ts-general-error" role="alert">
                {editTaskError}
              </div>
            )}

            <form
              onSubmit={handleSubmitEditTask}
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
            >
              <div className="ts-form-group">
                <label htmlFor="edit-task-title" className="ts-label">
                  Task Title *
                </label>
                <input
                  id="edit-task-title"
                  type="text"
                  value={editTaskTitle}
                  onChange={(e) => {
                    setEditTaskTitle(e.target.value)
                    if (editTaskError) setEditTaskError(null)
                  }}
                  className={`ts-input-field ${editTaskError ? 'has-error' : ''}`}
                />
              </div>

              <div className="ts-form-group">
                <label htmlFor="edit-task-due" className="ts-label">
                  Due Date (Optional)
                </label>
                <input
                  id="edit-task-due"
                  type="date"
                  value={editTaskDueDate}
                  onChange={(e) => setEditTaskDueDate(e.target.value)}
                  className="ts-input-field"
                />
              </div>

              <div className="ts-form-group">
                <label htmlFor="edit-task-desc" className="ts-label">
                  Description / Notes (Optional)
                </label>
                <textarea
                  id="edit-task-desc"
                  rows={3}
                  value={editTaskDesc}
                  onChange={(e) => setEditTaskDesc(e.target.value)}
                  className="ts-input-field"
                />
              </div>

              <div className="ts-form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 'var(--space-2)' }}>
                <input
                  id="edit-task-completed"
                  type="checkbox"
                  className="ts-todo-checkbox"
                  checked={editTaskCompleted}
                  onChange={(e) => setEditTaskCompleted(e.target.checked)}
                />
                <label htmlFor="edit-task-completed" className="ts-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
                  Mark as completed
                </label>
              </div>

              <div className="ts-modal-actions">
                <Button
                  variant="secondary"
                  size="md"
                  type="button"
                  onClick={() => setEditingTask(null)}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="md" type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE TASK CONFIRMATION MODAL (Milestone 6) */}
      {deletingTask && (
        <div className="ts-modal-overlay" role="dialog" aria-modal="true">
          <div className="ts-modal-box" style={{ maxWidth: '480px' }}>
            <h2 className="ts-modal-title" style={{ color: 'var(--color-error)' }}>
              Delete Task?
            </h2>
            <p className="ts-modal-desc">
              Are you sure you want to remove <strong>&ldquo;{deletingTask.title}&rdquo;</strong> from your to-do list? This action cannot be undone.
            </p>

            <div className="ts-modal-actions">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setDeletingTask(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleConfirmDeleteTask}
                style={{
                  backgroundColor: 'var(--color-error)',
                  borderColor: 'var(--color-error)',
                }}
              >
                Delete Task
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


export default TripWorkspacePage
