import { addPageLoad } from '~/utils/utils.server'
import type { Route } from './+types/stats'
import { getUserDetailedStats } from '~/utils/db-utils.server'
import { Link } from 'react-router'
import { capitalizeFirstLetter } from '~/utils/utils'

export async function loader({ params }: Route.LoaderArgs) {
    const user = params.user
    await addPageLoad(user)
    const detailedStats = await getUserDetailedStats(user)
    return { user, detailedStats }
}

export default function StatsPage({ loaderData }: Route.ComponentProps) {
    const { user, detailedStats } = loaderData

    // Calculate visits per day average
    const visitsPerDayAvg =
        detailedStats.dailyActivity.length > 0
            ? (detailedStats.totalViews / detailedStats.dailyActivity.length).toFixed(1)
            : '0'

    // Calculate success rate
    const totalAttempts = detailedStats.totalViews
    const successRate = totalAttempts > 0 ? ((detailedStats.totalResists / totalAttempts) * 100).toFixed(1) : '0'

    // Sort sites by fails (descending) to show most problematic sites
    const sortedSites = [...detailedStats.siteStats].sort((a, b) => b.fails - a.fails)

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Statistics - {user}</h1>
                    <Link to={`/${user}`} className="text-indigo-600 hover:text-indigo-700 font-medium">
                        Back to user page
                    </Link>
                </div>

                {/* Overall Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="text-3xl font-bold text-indigo-600">{detailedStats.streakDays}</div>
                        <div className="text-sm text-gray-600 mt-2">Days Streak</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="text-3xl font-bold text-blue-600">{detailedStats.totalViews}</div>
                        <div className="text-sm text-gray-600 mt-2">Total Visits</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="text-3xl font-bold text-green-600">{detailedStats.totalResists}</div>
                        <div className="text-sm text-gray-600 mt-2">Times Resisted</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="text-3xl font-bold text-red-600">{detailedStats.totalFails}</div>
                        <div className="text-sm text-gray-600 mt-2">Times Failed</div>
                    </div>
                </div>

                {/* Additional Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="text-2xl font-bold text-purple-600">{visitsPerDayAvg}</div>
                        <div className="text-sm text-gray-600 mt-2">Visits per Day Avg</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="text-2xl font-bold text-emerald-600">{successRate}%</div>
                        <div className="text-sm text-gray-600 mt-2">Success Rate</div>
                    </div>
                </div>

                {/* Daily Activity Chart */}
                <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Last 30 Days Activity</h2>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {detailedStats.dailyActivity.length === 0 ? (
                            <p className="text-gray-600">No activity in the last 30 days</p>
                        ) : (
                            detailedStats.dailyActivity.map((day) => {
                                const maxCount = Math.max(
                                    ...detailedStats.dailyActivity.map((d) => d.views + d.resists + d.fails),
                                    1
                                )
                                const totalDay = day.views + day.resists + day.fails
                                const viewPercentage = (day.views / maxCount) * 100
                                const resistPercentage = (day.resists / maxCount) * 100
                                const failPercentage = (day.fails / maxCount) * 100

                                return (
                                    <div key={day.date}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700">{day.date}</span>
                                            <span className="text-gray-600">Total: {totalDay}</span>
                                        </div>
                                        <div className="flex h-8 gap-1 rounded overflow-hidden bg-gray-100">
                                            {viewPercentage > 0 && (
                                                <div
                                                    style={{ width: `${viewPercentage}%` }}
                                                    className="bg-blue-500 hover:bg-blue-600 transition"
                                                    title={`Views: ${day.views}`}
                                                />
                                            )}
                                            {resistPercentage > 0 && (
                                                <div
                                                    style={{ width: `${resistPercentage}%` }}
                                                    className="bg-green-500 hover:bg-green-600 transition"
                                                    title={`Resists: ${day.resists}`}
                                                />
                                            )}
                                            {failPercentage > 0 && (
                                                <div
                                                    style={{ width: `${failPercentage}%` }}
                                                    className="bg-red-500 hover:bg-red-600 transition"
                                                    title={`Fails: ${day.fails}`}
                                                />
                                            )}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                    <div className="flex gap-4 mt-6 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-500 rounded" />
                            <span>Views</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500 rounded" />
                            <span>Resists</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-500 rounded" />
                            <span>Fails</span>
                        </div>
                    </div>
                </div>

                {/* Per Site Statistics */}
                <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Stats by Site</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Site</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Visits</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Resisted</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Failed</th>
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
                                                    to={`/${loaderData.user}/${site.siteId}`}
                                                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                                                >
                                                    {capitalizeFirstLetter(site.siteId)}
                                                </Link>
                                            </td>
                                            <td className="text-center py-3 px-4 text-blue-600 font-medium">
                                                {site.views}
                                            </td>
                                            <td className="text-center py-3 px-4 text-green-600 font-medium">
                                                {site.resists}
                                            </td>
                                            <td className="text-center py-3 px-4 text-red-600 font-medium">
                                                {site.fails}
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

                {/* Last Failure Info */}
                {detailedStats.lastFailureDate && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                        <p className="text-gray-700">
                            <span className="font-semibold">Last failure:</span>{' '}
                            {new Date(detailedStats.lastFailureDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
