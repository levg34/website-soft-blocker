import type { Route } from './+types/stats'
import { getUserDetailedStats, userExists } from '~/utils/db-utils.server'
import { Link, redirect } from 'react-router'
import { capitalizeFirstLetter } from '~/utils/utils'
import { OverallStats, AdditionalMetrics, ActivityChart, LastFailureInfo, PageHeader, StreakStats } from '~/components'

export async function loader({ params }: Route.LoaderArgs) {
    const user = params.user
    if (!userExists(user)) {
        return redirect('/')
    }
    const detailedStats = await getUserDetailedStats(user)
    return { user, detailedStats }
}

export default function StatsPage({ loaderData }: Route.ComponentProps) {
    const { user, detailedStats } = loaderData

    // Sort sites by fails (descending) to show most problematic sites
    const sortedSites = [...detailedStats.siteStats].sort((a, b) => b.fails - a.fails)

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <PageHeader
                    title="Statistics"
                    subtitle={`${user}'s detailed analysis`}
                    backLink={`/${user}`}
                    backLabel="Back to user page"
                />

                <OverallStats
                    stats={{
                        streakDays: detailedStats.streakDays,
                        totalViews: detailedStats.totalViews,
                        totalResists: detailedStats.totalResists,
                        totalFails: detailedStats.totalFails
                    }}
                />

                <StreakStats
                    stats={{
                        currentStreak: detailedStats.currentStreak,
                        longestStreak: detailedStats.longestStreak,
                        averageStreak: detailedStats.averageStreak,
                        totalStreaks: detailedStats.totalStreaks
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

                <ActivityChart data={detailedStats.dailyActivity} title="Last 30 Days Activity" />

                {/* Per Site Statistics */}
                <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Stats by Site</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Site</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Visits</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Visits/Day</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Days Tracked</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Resisted</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Failed</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Fails/Day</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Streak</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Success Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedSites.map((site) => {
                                    const siteSuccessRate =
                                        site.views > 0 ? ((site.resists / site.views) * 100).toFixed(1) : '0'

                                    return (
                                        <tr key={site.siteId} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <Link
                                                    to={`/${loaderData.user}/stats/${site.siteId}`}
                                                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                                                >
                                                    {capitalizeFirstLetter(site.siteId)}
                                                </Link>
                                            </td>
                                            <td className="text-center py-3 px-4 text-blue-600 font-medium">
                                                {site.views}
                                            </td>
                                            <td className="text-center py-3 px-4 text-purple-600 font-medium">
                                                {site.visitsPerDay}
                                            </td>
                                            <td className="text-center py-3 px-4 text-gray-700">
                                                {site.daysTracked} days
                                            </td>
                                            <td className="text-center py-3 px-4 text-green-600 font-medium">
                                                {site.resists}
                                            </td>
                                            <td className="text-center py-3 px-4 text-red-600 font-medium">
                                                {site.fails}
                                            </td>
                                            <td className="text-center py-3 px-4 text-red-500 font-medium">
                                                {site.failsPerDay}
                                            </td>
                                            <td className="text-center py-3 px-4 font-medium text-indigo-600">
                                                {site.streakDays} days
                                            </td>
                                            <td className="text-center py-3 px-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                        parseFloat(siteSuccessRate) >= 50
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}
                                                >
                                                    {siteSuccessRate}%
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <LastFailureInfo lastFailureDate={detailedStats.lastFailureDate} />
            </div>
        </div>
    )
}
