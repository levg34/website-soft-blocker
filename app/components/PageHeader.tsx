/**
 * Reusable component for page headers with title and back link
 */
import { Link } from 'react-router'

interface PageHeaderProps {
    title: string
    subtitle?: string
    backLink: string
    backLabel?: string
}

export function PageHeader({ title, subtitle, backLink, backLabel = 'Back' }: PageHeaderProps) {
    return (
        <div className="flex justify-between items-start mb-8">
            <div>
                <h1 className="text-4xl font-bold text-gray-900">{title}</h1>
                {subtitle && <p className="text-lg text-gray-600 mt-2">{subtitle}</p>}
            </div>
            <Link to={backLink} className="text-indigo-600 hover:text-indigo-700 font-medium">
                {backLabel}
            </Link>
        </div>
    )
}
