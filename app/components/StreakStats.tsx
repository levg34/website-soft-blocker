/**
 * Reusable component for displaying streak statistics
 */
import { StatsCard } from './StatsCard'

interface StreakStatsData {
    currentStreak: number
    longestStreak: number
    averageStreak: number
    totalStreaks: number
}

interface StreakStatsProps {
    stats: StreakStatsData
}

export function StreakStats({ stats }: StreakStatsProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatsCard value={stats.currentStreak} label="Current Streak" color="indigo" size="lg" />
            <StatsCard value={stats.longestStreak} label="Longest Streak" color="purple" size="lg" />
            <StatsCard value={stats.averageStreak} label="Avg Streak" color="blue" size="lg" />
            <StatsCard value={stats.totalStreaks} label="Total Streaks" color="green" size="lg" />
        </div>
    )
}
