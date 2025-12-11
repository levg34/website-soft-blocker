/**
 * Reusable component for activity chart using Recharts
 */
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ActivityData {
    date: string
    views: number
    resists: number
    fails: number
}

interface ActivityChartProps {
    data: ActivityData[]
    title?: string
    emptyMessage?: string
}

export function ActivityChart({ data, title = 'Activity', emptyMessage = 'No activity recorded' }: ActivityChartProps) {
    return (
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">{title}</h2>
            {data.length === 0 ? (
                <p className="text-gray-600">{emptyMessage}</p>
            ) : (
                <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={data}>
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
    )
}
