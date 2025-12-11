interface Badge {
    id: string
    title: string
    description?: string
    threshold?: number
    emoji?: string
    earned?: boolean
    newly?: boolean
}

export function BadgeCard({ badge }: { badge: Badge }) {
    return (
        <div
            className={`p-4 rounded-lg border flex flex-col justify-between h-full ${
                badge.earned ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'
            } ${badge.newly ? 'transform transition duration-500 scale-105 shadow-xl' : ''}`}
        >
            <div>
                <div className="flex items-center space-x-2">
                    {badge.earned && badge.emoji ? (
                        <div className="text-2xl" aria-hidden>
                            {badge.emoji}
                        </div>
                    ) : null}
                    <div className="font-semibold text-gray-800">{badge.title}</div>
                </div>
                {badge.description ? <div className="text-sm text-gray-600 mt-1">{badge.description}</div> : null}
            </div>
            <div className="mt-3 text-xs font-medium text-gray-700">
                {badge.earned ? (
                    <div className="flex items-center justify-between">
                        <span className="text-green-700">Earned</span>
                        {badge.newly ? (
                            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">New</span>
                        ) : null}
                    </div>
                ) : (
                    <span>
                        Need {badge.threshold ?? '?'} day{(badge.threshold ?? 0) > 1 ? 's' : ''}
                    </span>
                )}
            </div>
        </div>
    )
}

export default BadgeCard
