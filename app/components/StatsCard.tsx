/**
 * Reusable component for displaying stats cards
 */
interface StatsCardProps {
    value: string | number
    label: string
    color?: 'indigo' | 'blue' | 'green' | 'red' | 'purple' | 'purple-500' | 'green-500' | 'red-500' | 'emerald'
    size?: 'sm' | 'lg'
}

const colorMap = {
    indigo: 'text-indigo-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
    'purple-500': 'text-purple-500',
    'green-500': 'text-green-500',
    'red-500': 'text-red-500',
    emerald: 'text-emerald-600'
}

export function StatsCard({ value, label, color = 'indigo', size = 'lg' }: StatsCardProps) {
    const textSize = size === 'lg' ? 'text-3xl' : 'text-2xl'
    const colorClass = colorMap[color]

    return (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className={`${textSize} font-bold ${colorClass}`}>{value}</div>
            <div className="text-sm text-gray-600 mt-2">{label}</div>
        </div>
    )
}
