import { getUserStats } from './db-utils.server'
import badgesJson from '../../badges.json'

export type Badge = {
    id: string
    title: string
    description?: string
    threshold?: number
    emoji?: string
    earned?: boolean
}

/**
 * Read badges.json and return badges whose criteria.type === 'streak_days'
 * Mark them as earned if user's streakDays >= threshold
 */
export async function getUserStreakBadges(username: string): Promise<Badge[]> {
    const stats = await getUserStats(username)
    const streakDays = stats?.streakDays || 0

    const allBadges: any[] = badgesJson as any[]
    const streakBadges = allBadges.filter((b) => b.criteria && b.criteria.type === 'streak_days')

    const mapped: Badge[] = streakBadges.map((b) => ({
        id: b.id,
        title: b.title,
        description: b.description,
        threshold: b.criteria?.threshold,
        emoji: b.emoji,
        earned: typeof b.criteria?.threshold === 'number' ? streakDays >= b.criteria.threshold : false
    }))

    // Return only earned badges (server-side filter)
    return mapped.filter((m) => m.earned)
}

export function getAllStreakBadges(): Badge[] {
    const allBadges: any[] = badgesJson as any[]
    const streak = allBadges.filter((b) => b.criteria && b.criteria.type === 'streak_days')
    const mapped: Badge[] = streak.map((b) => {
        return {
            id: b.id,
            title: b.title,
            description: b.description,
            threshold: b.criteria?.threshold,
            emoji: b.emoji
        }
    })

    return mapped
}

export default getUserStreakBadges
