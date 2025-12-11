/**
 * Reusable component for displaying additional metrics grid
 */
import { StatsCard } from './StatsCard'

interface MetricData {
    visitsPerDay: number
    resistsPerDay: number
    failsPerDay: number
    avgViewsLast15Days: number
    avgResistsLast15Days: number
    avgFailsLast15Days: number
}

interface AdditionalMetricsProps {
    metrics: MetricData
}

export function AdditionalMetrics({ metrics }: AdditionalMetricsProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            <StatsCard value={metrics.visitsPerDay} label="Visits/Day" color="purple" size="sm" />
            <StatsCard value={metrics.resistsPerDay} label="Resists/Day" color="green" size="sm" />
            <StatsCard value={metrics.failsPerDay} label="Fails/Day" color="red" size="sm" />
            <StatsCard value={metrics.avgViewsLast15Days} label="Avg Visits/Day (15d)" color="purple-500" size="sm" />
            <StatsCard value={metrics.avgResistsLast15Days} label="Avg Resists/Day (15d)" color="green-500" size="sm" />
            <StatsCard value={metrics.avgFailsLast15Days} label="Avg Fails/Day (15d)" color="red-500" size="sm" />
        </div>
    )
}
