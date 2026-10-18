/**
 * Calculates trip status based on start and end dates relative to today.
 *
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 * @returns {'Upcoming' | 'Ongoing' | 'Completed'}
 */
export function getTripStatus(startDate, endDate) {
  if (!startDate || !endDate) return 'Upcoming'

  const todayStr = new Date().toISOString().split('T')[0]
  if (todayStr < startDate) {
    return 'Upcoming'
  }
  if (todayStr > endDate) {
    return 'Completed'
  }
  return 'Ongoing'
}

/**
 * Calculates trip duration in days (inclusive).
 *
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 * @returns {number}
 */
export function getTripDurationDays(startDate, endDate) {
  if (!startDate || !endDate) return 1
  const [startYear, startMonth, startDay] = startDate.split('-').map(Number)
  const [endYear, endMonth, endDay] = endDate.split('-').map(Number)
  if (!startYear || !startMonth || !startDay || !endYear || !endMonth || !endDay) return 1

  const start = new Date(startYear, startMonth - 1, startDay)
  const end = new Date(endYear, endMonth - 1, endDay)
  const diffTime = end.getTime() - start.getTime()
  if (diffTime < 0) return 1
  return Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1)
}

/**
 * Formats a numeric amount into Indian Rupee format (e.g. ₹1,50,000).
 *
 * @param {number|string|null} amount
 * @returns {string}
 */
export function formatINR(amount) {
  if (amount === null || amount === undefined || amount === '' || isNaN(Number(amount))) {
    return 'Unset'
  }
  return `₹${Number(amount).toLocaleString('en-IN')}`
}

/**
 * Calculates the average budget per traveler.
 *
 * @param {number|string|null} totalBudget
 * @param {number} travelers
 * @returns {number|null}
 */
export function calculateAverageBudget(totalBudget, travelers) {
  if (
    totalBudget === null ||
    totalBudget === undefined ||
    totalBudget === '' ||
    isNaN(Number(totalBudget))
  ) {
    return null
  }
  const count = parseInt(travelers, 10)
  if (isNaN(count) || count <= 0) return null
  return Math.round(Number(totalBudget) / count)
}

/**
 * Generates an array of day objects for every calendar date in the trip's date range,
 * including both start and end dates. Uses local date parsing to prevent timezone offset shifts.
 *
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 * @returns {Array<{ dayNumber: number, dateString: string, formattedDate: string, dayOfWeek: string, label: string }>}
 */
export function getTripDaysList(startDate, endDate) {
  if (!startDate || !endDate) return []

  const [startYear, startMonth, startDay] = startDate.split('-').map(Number)
  const [endYear, endMonth, endDay] = endDate.split('-').map(Number)
  if (!startYear || !startMonth || !startDay || !endYear || !endMonth || !endDay) return []

  const start = new Date(startYear, startMonth - 1, startDay)
  const end = new Date(endYear, endMonth - 1, endDay)
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
    return []
  }

  const days = []
  const current = new Date(start)
  let dayNumber = 1

  while (current <= end) {
    const y = current.getFullYear()
    const m = String(current.getMonth() + 1).padStart(2, '0')
    const d = String(current.getDate()).padStart(2, '0')
    const dateString = `${y}-${m}-${d}`

    const formattedDate = current.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }) // e.g. "15 Jan 2027"

    const dayOfWeek = current.toLocaleDateString('en-US', { weekday: 'short' }) // e.g. "Fri"

    days.push({
      dayNumber,
      dateString,
      formattedDate,
      dayOfWeek,
      label: `Day ${dayNumber} — ${formattedDate}`,
    })

    current.setDate(current.getDate() + 1)
    dayNumber++
  }

  return days
}

/**
 * Predictably sorts day activities: timed activities chronologically,
 * untimed activities ordered by creation time.
 *
 * @param {Array<Object>} activities
 * @returns {Array<Object>}
 */
export function sortActivities(activities = []) {
  return [...activities].sort((a, b) => {
    const timeA = a.time?.trim() || ''
    const timeB = b.time?.trim() || ''
    if (timeA && timeB) {
      return timeA.localeCompare(timeB)
    }
    if (timeA && !timeB) return -1
    if (!timeA && timeB) return 1
    return (a.createdAt || '').localeCompare(b.createdAt || '')
  })
}

/**
 * Formats a 24-hour time string (e.g. "09:30" or "14:15") into user-friendly 12-hour format ("9:30 AM" or "2:15 PM").
 *
 * @param {string} timeStr
 * @returns {string}
 */
export function formatTimeDisplay(timeStr) {
  if (!timeStr) return ''
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})$/)
  if (match) {
    let hour = parseInt(match[1], 10)
    const mins = match[2]
    const ampm = hour >= 12 ? 'PM' : 'AM'
    hour = hour % 12 || 12
    return `${hour}:${mins} ${ampm}`
  }
  return timeStr
}

/**
 * Standard expense categories supported across TripSync.
 */
export const EXPENSE_CATEGORIES = [
  { id: 'Transport', label: 'Transport', icon: '🚆' },
  { id: 'Accommodation', label: 'Accommodation', icon: '🏨' },
  { id: 'Food', label: 'Food & Dining', icon: '🍽️' },
  { id: 'Activities', label: 'Activities', icon: '🎟️' },
  { id: 'Shopping', label: 'Shopping', icon: '🛍️' },
  { id: 'Other', label: 'Other', icon: '📦' },
]

/**
 * Calculates total spent across an array of expense records.
 *
 * @param {Array<Object>} expenses
 * @returns {number}
 */
export function calculateTotalSpent(expenses = []) {
  if (!Array.isArray(expenses)) return 0
  return expenses.reduce((sum, item) => {
    const val = Number(item?.amount)
    return !isNaN(val) && val > 0 ? sum + val : sum
  }, 0)
}

/**
 * Calculates remaining trip budget.
 *
 * @param {number|string|null} totalBudget
 * @param {number} totalSpent
 * @returns {number}
 */
export function calculateRemainingBudget(totalBudget, totalSpent) {
  const budget = Number(totalBudget)
  if (isNaN(budget) || budget <= 0) return 0
  return budget - (totalSpent || 0)
}

/**
 * Computes budget usage metrics including percentage, overspent status, and progress width.
 *
 * @param {number|string|null} totalBudget
 * @param {number} totalSpent
 * @returns {{ percentage: number, isOverBudget: boolean, overspentAmount: number, progressPercent: number }}
 */
export function calculateBudgetUsage(totalBudget, totalSpent) {
  const budget = Number(totalBudget)
  const spent = Number(totalSpent) || 0
  if (isNaN(budget) || budget <= 0) {
    return {
      percentage: 0,
      isOverBudget: spent > 0,
      overspentAmount: spent,
      progressPercent: spent > 0 ? 100 : 0,
    }
  }

  const rawPercent = Math.round((spent / budget) * 100)
  const isOverBudget = spent > budget
  const overspentAmount = isOverBudget ? spent - budget : 0
  const progressPercent = Math.min(100, Math.max(0, rawPercent))

  return {
    percentage: rawPercent,
    isOverBudget,
    overspentAmount,
    progressPercent,
  }
}

/**
 * Computes category-wise spending breakdown with totals, counts, and percentages.
 *
 * @param {Array<Object>} expenses
 * @returns {Array<{ id: string, label: string, icon: string, total: number, count: number, percentage: number }>}
 */
export function getCategoryBreakdown(expenses = []) {
  const totalSpent = calculateTotalSpent(expenses)

  return EXPENSE_CATEGORIES.map((cat) => {
    const catExpenses = expenses.filter(
      (e) => e && (e.category || '').toLowerCase() === cat.id.toLowerCase()
    )
    const total = catExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
    const count = catExpenses.length
    const percentage = totalSpent > 0 ? Math.round((total / totalSpent) * 100) : 0

    return {
      id: cat.id,
      label: cat.label,
      icon: cat.icon,
      total,
      count,
      percentage,
    }
  })
}

/**
 * Formats an expense date (YYYY-MM-DD) to friendly display format (e.g. 15 Jan 2027).
 *
 * @param {string} dateStr
 * @returns {string}
 */
export function formatExpenseDate(dateStr) {
  if (!dateStr) return ''
  try {
    const [y, m, d] = dateStr.split('-').map(Number)
    if (!y || !m || !d) return dateStr
    const date = new Date(y, m - 1, d)
    if (isNaN(date.getTime())) return dateStr
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

/**
 * Standard booking categories supported across TripSync.
 */
export const BOOKING_CATEGORIES = [
  { id: 'accommodation', label: 'Accommodation' },
  { id: 'transport', label: 'Transport' },
  { id: 'activity', label: 'Activities & Reservations' },
]

/**
 * Standard transport types.
 */
export const TRANSPORT_TYPES = ['Flight', 'Train', 'Bus', 'Car', 'Other']

/**
 * Formats a booking date or datetime string (YYYY-MM-DD or YYYY-MM-DDTHH:mm).
 * Returns clean human-readable text (e.g. "15 Jan 2027" or "15 Jan 2027, 2:30 PM").
 *
 * @param {string} dateOrDateTimeStr
 * @returns {string}
 */
export function formatBookingDate(dateOrDateTimeStr) {
  if (!dateOrDateTimeStr) return ''

  // Case: ISO datetime with 'T' (e.g. 2027-01-15T14:30)
  if (dateOrDateTimeStr.includes('T')) {
    const [datePart, timePart] = dateOrDateTimeStr.split('T')
    const formattedDate = formatExpenseDate(datePart)
    if (!formattedDate) return dateOrDateTimeStr
    const formattedTime = timePart ? formatTimeDisplay(timePart.substring(0, 5)) : ''
    return formattedTime ? `${formattedDate}, ${formattedTime}` : formattedDate
  }

  // Case: standard YYYY-MM-DD date
  return formatExpenseDate(dateOrDateTimeStr)
}

/**
 * Validates booking data according to category rules.
 *
 * @param {Object} bookingData
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateBookingData(bookingData) {
  if (!bookingData || typeof bookingData !== 'object') {
    return { valid: false, error: 'Booking information is required.' }
  }

  const category = (bookingData.category || '').toLowerCase().trim()
  if (!category || !['accommodation', 'transport', 'activity'].includes(category)) {
    return { valid: false, error: 'Please select a valid booking category.' }
  }

  if (category === 'accommodation') {
    const name = (bookingData.name || bookingData.propertyName || '').trim()
    if (!name) {
      return { valid: false, error: 'Property or hotel name is required.' }
    }
    const location = (bookingData.location || bookingData.address || '').trim()
    if (!location) {
      return { valid: false, error: 'Address or location is required.' }
    }
    const checkIn = (bookingData.checkInDate || '').trim()
    if (!checkIn) {
      return { valid: false, error: 'Check-in date is required.' }
    }
    const checkOut = (bookingData.checkOutDate || '').trim()
    if (!checkOut) {
      return { valid: false, error: 'Check-out date is required.' }
    }
    if (checkOut <= checkIn) {
      return { valid: false, error: 'Check-out date must be later than check-in date.' }
    }
  } else if (category === 'transport') {
    const transportType = (bookingData.transportType || '').trim()
    if (!transportType || !TRANSPORT_TYPES.includes(transportType)) {
      return { valid: false, error: 'Transport type is required (Flight, Train, Bus, Car, or Other).' }
    }
    const operator = (bookingData.operator || '').trim()
    if (!operator) {
      return { valid: false, error: 'Operator or carrier is required.' }
    }
    const bookingRef = (bookingData.bookingRef || bookingData.reference || '').trim()
    if (!bookingRef) {
      return { valid: false, error: 'Booking reference or PNR is required.' }
    }
    const departureLoc = (bookingData.departureLocation || '').trim()
    if (!departureLoc) {
      return { valid: false, error: 'Departure location is required.' }
    }
    const arrivalLoc = (bookingData.arrivalLocation || '').trim()
    if (!arrivalLoc) {
      return { valid: false, error: 'Arrival location is required.' }
    }
    const departure = (bookingData.departureDateTime || '').trim()
    if (!departure) {
      return { valid: false, error: 'Departure date & time is required.' }
    }
    const arrival = (bookingData.arrivalDateTime || '').trim()
    if (!arrival) {
      return { valid: false, error: 'Arrival date & time is required.' }
    }
    if (arrival < departure) {
      return { valid: false, error: 'Arrival date & time cannot be earlier than departure date & time.' }
    }
  } else if (category === 'activity') {
    const name = (bookingData.name || '').trim()
    if (!name) {
      return { valid: false, error: 'Booking or activity name is required.' }
    }
    const reservationDateTime = (bookingData.reservationDateTime || '').trim()
    if (!reservationDateTime) {
      return { valid: false, error: 'Reservation date & time is required.' }
    }
  }

  return { valid: true }
}

/**
 * Validates task data.
 *
 * @param {Object} taskData
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateTaskData(taskData) {
  if (!taskData || typeof taskData !== 'object') {
    return { valid: false, error: 'Task information is required.' }
  }

  const title = (taskData.title || '').trim()
  if (!title) {
    return { valid: false, error: 'Task title is required.' }
  }

  return { valid: true }
}

/**
 * Formats a task due date with context relative to trip dates.
 *
 * @param {string} dueDate
 * @param {string} [tripStartDate]
 * @param {string} [tripEndDate]
 * @returns {string}
 */
export function formatTaskDueDate(dueDate, tripStartDate = null, tripEndDate = null) {
  if (!dueDate) return ''
  const formatted = formatExpenseDate(dueDate)
  if (!formatted) return dueDate

  if (tripStartDate && tripEndDate) {
    if (dueDate < tripStartDate) {
      return `${formatted} (Before trip)`
    } else if (dueDate >= tripStartDate && dueDate <= tripEndDate) {
      return `${formatted} (During trip)`
    } else if (dueDate > tripEndDate) {
      return `${formatted} (After trip)`
    }
  } else if (tripStartDate) {
    if (dueDate < tripStartDate) {
      return `${formatted} (Before trip)`
    } else if (dueDate >= tripStartDate) {
      return `${formatted} (Trip time)`
    }
  }
  return formatted
}

