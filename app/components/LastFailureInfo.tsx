/**
 * Reusable component for displaying last failure information
 */

interface LastFailureInfoProps {
    lastFailureDate: Date | null
}

export function LastFailureInfo({ lastFailureDate }: LastFailureInfoProps) {
    if (!lastFailureDate) {
        return null
    }

    return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <p className="text-gray-700">
                <span className="font-semibold">Last failure:</span>{' '}
                {new Date(lastFailureDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}
            </p>
        </div>
    )
}
