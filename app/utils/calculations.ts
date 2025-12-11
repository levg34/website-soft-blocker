/**
 * Calculate success rate as percentage
 * @param views - Total views/attempts
 * @param resists - Number of successful resists
 * @returns Success rate as percentage string (e.g., "75.5")
 */
export function calculateSuccessRate(views: number, resists: number): string {
    if (views === 0) return '0'
    return ((resists / views) * 100).toFixed(1)
}

/**
 * Calculate average of a metric over days
 * @param total - Total value
 * @param days - Number of days to average over
 * @returns Average as string with 1 decimal place
 */
export function calculateAverage(total: number, days: number): string {
    if (days === 0) return '0'
    return (total / days).toFixed(1)
}

/**
 * Find last failure date from event list
 * @param events - Array of events with timestamp
 * @returns Last failure timestamp or null
 */
export function findLastFailureDate(events: Array<{ action: string; timestamp: Date }>): Date | null {
    const failures = events.filter((e) => e.action === 'fail')
    if (failures.length === 0) return null
    return failures[failures.length - 1].timestamp
}

/**
 * Calculate streak periods from events (consecutive calendar days without failures)
 * @param events - Array of events sorted by timestamp
 * @returns Array of streak periods with start, end, and length (in calendar days)
 */
export function calculateStreakPeriods(
    events: Array<{ action: string; timestamp: Date }>
): Array<{ startDate: Date; endDate: Date; days: number }> {
    if (events.length === 0) return []

    const sortedEvents = [...events].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    const streaks: Array<{ startDate: Date; endDate: Date; days: number }> = []

    // Helper function to get calendar date (without time)
    const getCalendarDate = (date: Date): Date => {
        const d = new Date(date)
        d.setHours(0, 0, 0, 0)
        return d
    }

    // Helper function to count calendar days between two dates (inclusive)
    const countCalendarDays = (start: Date, end: Date): number => {
        const startDate = getCalendarDate(start)
        const endDate = getCalendarDate(end)
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
        return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
    }

    // Get all unique calendar dates with failures
    const failureDates = new Set<string>()
    for (const event of sortedEvents) {
        if (event.action === 'fail') {
            failureDates.add(getCalendarDate(event.timestamp).toISOString().split('T')[0])
        }
    }

    // If there are any events, find the date range
    const firstDate = getCalendarDate(sortedEvents[0].timestamp)
    const lastDate = getCalendarDate(sortedEvents[sortedEvents.length - 1].timestamp)

    // Build streaks: consecutive calendar days without failures
    let streakStart: Date | null = null
    let currentDate = new Date(firstDate)

    while (currentDate <= lastDate) {
        const dateStr = currentDate.toISOString().split('T')[0]
        const hasFail = failureDates.has(dateStr)

        if (!hasFail) {
            // This day has no failures
            if (streakStart === null) {
                streakStart = new Date(currentDate)
            }
        } else {
            // This day has a failure - end the current streak
            if (streakStart !== null) {
                const prevDate = new Date(currentDate)
                prevDate.setDate(prevDate.getDate() - 1)
                const days = countCalendarDays(streakStart, prevDate)
                streaks.push({
                    startDate: streakStart,
                    endDate: prevDate,
                    days
                })
                streakStart = null
            }
        }

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1)
    }

    // Add final streak if one is in progress
    if (streakStart !== null) {
        const days = countCalendarDays(streakStart, lastDate)
        streaks.push({
            startDate: streakStart,
            endDate: lastDate,
            days
        })
    }

    return streaks
}

/**
 * Get longest streak from list of streaks
 * @param streaks - Array of streak periods
 * @returns Longest streak length in days
 */
export function getLongestStreak(streaks: Array<{ days: number }>): number {
    if (streaks.length === 0) return 0
    return Math.max(...streaks.map((s) => s.days))
}

/**
 * Get average streak length
 * @param streaks - Array of streak periods
 * @returns Average streak length
 */
export function getAverageStreak(streaks: Array<{ days: number }>): number {
    if (streaks.length === 0) return 0
    const total = streaks.reduce((sum, s) => sum + s.days, 0)
    return parseFloat((total / streaks.length).toFixed(2))
}
