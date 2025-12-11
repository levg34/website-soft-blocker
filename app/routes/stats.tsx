import { addPageLoad } from '~/utils/utils.server'
import type { Route } from './+types/stats'
import { getUserDetailedStats } from '~/utils/db-utils.server'
import { Link } from 'react-router'
import { capitalizeFirstLetter } from '~/utils/utils'
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

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
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Statistics</h1>
                        <p className="text-lg text-gray-600 mt-2">{user}'s detailed analysis</p>
                    </div>
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
                    {detailedStats.dailyActivity.length === 0 ? (
                        <p className="text-gray-600">No activity in the last 30 days</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={400}>
                            <ComposedChart data={detailedStats.dailyActivity}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="date" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '0.5rem'
                                    }}
                                    labelStyle={{ color: '#1f2937' }}
                                />
                                <Legend />
                                <Bar dataKey="views" fill="#3b82f6" name="Views" />
                                <Bar dataKey="resists" fill="#10b981" name="Resists" />
                                <Bar dataKey="fails" fill="#ef4444" name="Fails" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    )}
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
