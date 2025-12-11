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
 * Calculate streak periods from events
 * @param events - Array of events sorted by timestamp
 * @returns Array of streak periods with start, end, and length
 */
export function calculateStreakPeriods(
    events: Array<{ action: string; timestamp: Date }>
): Array<{ startDate: Date; endDate: Date; days: number }> {
    if (events.length === 0) return []

    const sortedEvents = [...events].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    const streaks: Array<{ startDate: Date; endDate: Date; days: number }> = []
    let streakStart = sortedEvents[0].timestamp
    let lastEventDate = sortedEvents[0].timestamp

    for (let i = 1; i < sortedEvents.length; i++) {
        const event = sortedEvents[i]
        const prevEvent = sortedEvents[i - 1]

        // Check if this is a failure
        if (event.action === 'fail') {
            // End current streak
            const diffTime = Math.abs(lastEventDate.getTime() - streakStart.getTime())
            const days = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
            streaks.push({
                startDate: streakStart,
                endDate: lastEventDate,
                days
            })
            // Start new streak after failure
            streakStart = event.timestamp
        }

        lastEventDate = event.timestamp
    }

    // Add the final streak
    const diffTime = Math.abs(lastEventDate.getTime() - streakStart.getTime())
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
    streaks.push({
        startDate: streakStart,
        endDate: lastEventDate,
        days
    })

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
