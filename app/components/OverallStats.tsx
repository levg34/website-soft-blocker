/**
 * Reusable component for displaying overall stats grid
 */
import { StatsCard } from './StatsCard'

interface OverallStatsData {
    streakDays: number
    totalViews: number
    totalResists: number
    totalFails: number
}

interface OverallStatsProps {
    stats: OverallStatsData
}

export function OverallStats({ stats }: OverallStatsProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatsCard value={stats.streakDays} label="Days Streak" color="indigo" size="lg" />
            <StatsCard value={stats.totalViews} label="Total Visits" color="blue" size="lg" />
            <StatsCard value={stats.totalResists} label="Times Resisted" color="green" size="lg" />
            <StatsCard value={stats.totalFails} label="Times Failed" color="red" size="lg" />
        </div>
    )
}
