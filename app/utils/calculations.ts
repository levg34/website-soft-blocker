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
