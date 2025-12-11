import { addPageLoad } from '~/utils/utils.server'
import type { Route } from './+types/site-stats'
import { getSiteDetailedStats } from '~/utils/db-utils.server'
import { Link } from 'react-router'
import { capitalizeFirstLetter } from '~/utils/utils'
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

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

    // Calculate success rate
    const totalAttempts = detailedStats.views
    const successRate = totalAttempts > 0 ? ((detailedStats.resists / totalAttempts) * 100).toFixed(1) : '0'

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">{siteName}</h1>
                        <p className="text-lg text-gray-600 mt-2">Detailed statistics for {user}</p>
                    </div>
                    <Link to={`/${user}/stats`} className="text-indigo-600 hover:text-indigo-700 font-medium">
                        Back to all stats
                    </Link>
                </div>

                {/* Overall Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="text-3xl font-bold text-indigo-600">{detailedStats.streakDays}</div>
                        <div className="text-sm text-gray-600 mt-2">Days Streak</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="text-3xl font-bold text-blue-600">{detailedStats.views}</div>
                        <div className="text-sm text-gray-600 mt-2">Total Visits</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="text-3xl font-bold text-green-600">{detailedStats.resists}</div>
                        <div className="text-sm text-gray-600 mt-2">Times Resisted</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="text-3xl font-bold text-red-600">{detailedStats.fails}</div>
                        <div className="text-sm text-gray-600 mt-2">Times Failed</div>
                    </div>
                </div>

                {/* Additional Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="text-2xl font-bold text-purple-600">{detailedStats.visitsPerDay}</div>
                        <div className="text-sm text-gray-600 mt-2">Visits/Day</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="text-2xl font-bold text-green-600">{detailedStats.resistsPerDay}</div>
                        <div className="text-sm text-gray-600 mt-2">Resists/Day</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="text-2xl font-bold text-red-600">{detailedStats.failsPerDay}</div>
                        <div className="text-sm text-gray-600 mt-2">Fails/Day</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="text-2xl font-bold text-purple-500">{detailedStats.avgViewsLast15Days}</div>
                        <div className="text-sm text-gray-600 mt-2">Avg Visits/Day (15d)</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="text-2xl font-bold text-green-500">{detailedStats.avgResistsLast15Days}</div>
                        <div className="text-sm text-gray-600 mt-2">Avg Resists/Day (15d)</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="text-2xl font-bold text-red-500">{detailedStats.avgFailsLast15Days}</div>
                        <div className="text-sm text-gray-600 mt-2">Avg Fails/Day (15d)</div>
                    </div>
                </div>

                {/* Daily Activity Chart */}
                <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Activity History</h2>
                    {detailedStats.dailyActivity.length === 0 ? (
                        <p className="text-gray-600">No activity recorded for this site</p>
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
