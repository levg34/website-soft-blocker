import { addPageLoad } from '~/utils/utils.server'
import type { Route } from './+types/site-stats'
import { getSiteDetailedStats } from '~/utils/db-utils.server'
import { Link } from 'react-router'
import { capitalizeFirstLetter } from '~/utils/utils'
import { OverallStats, AdditionalMetrics, ActivityChart, LastFailureInfo, PageHeader } from '~/components'

export async function loader({ params }: Route.LoaderArgs) {
    const user = params.user
    const site = params.site
    await addPageLoad(user)
    const detailedStats = await getSiteDetailedStats(user, site)
    return { user, site, detailedStats }
}

export default function SiteStatsPage({ loaderData }: Route.ComponentProps) {
    const { user, site, detailedStats } = loaderData
    const siteName = capitalizeFirstLetter(site)

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <PageHeader
                    title={siteName}
                    subtitle={`Detailed statistics for ${user}`}
                    backLink={`/${user}/stats`}
                    backLabel="Back to all stats"
                />

                <OverallStats
                    stats={{
                        streakDays: detailedStats.streakDays,
                        totalViews: detailedStats.views,
                        totalResists: detailedStats.resists,
                        totalFails: detailedStats.fails
                    }}
                />

                <AdditionalMetrics
                    metrics={{
                        visitsPerDay: detailedStats.visitsPerDay,
                        resistsPerDay: detailedStats.resistsPerDay,
                        failsPerDay: detailedStats.failsPerDay,
                        avgViewsLast15Days: detailedStats.avgViewsLast15Days,
                        avgResistsLast15Days: detailedStats.avgResistsLast15Days,
                        avgFailsLast15Days: detailedStats.avgFailsLast15Days
                    }}
                />

                <ActivityChart
                    data={detailedStats.dailyActivity}
                    title="Activity History"
                    emptyMessage="No activity recorded for this site"
                />

                <LastFailureInfo lastFailureDate={detailedStats.lastFailureDate} />

                {/* Time Range Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <p className="text-gray-700">
                        <span className="font-semibold">Tracking period:</span> {detailedStats.daysTracked} days
                    </p>
                </div>
            </div>
        </div>
    )
}
