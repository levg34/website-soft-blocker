import { addPageLoad, getUserSites } from '~/utils/utils.server'
import type { Route } from './+types/user'
import { capitalizeFirstLetter } from '~/utils/utils'
import { Form, Link } from 'react-router'
import { getUserStats } from '~/utils/db-utils.server'
import { OverallStats, PageHeader } from '~/components'

export async function loader({ params }: Route.LoaderArgs) {
    const user = params.user
    await addPageLoad(user)
    const sites = await getUserSites(user)
    const stats = await getUserStats(user)
    return { user, sites, stats }
}

export async function action({ params, request }: Route.ActionArgs) {
    const user = params.user
    const formData = await request.formData()
    const url = formData.get('url') as string

    if (url) {
        // Derive siteId from URL. must have no '.' and be lowercase. Example: example.com -> example
        const siteId = new URL(url).hostname.replace('www.', '').split('.')[0].toLowerCase()

        // Create a new tracked site object
        const newTrackedSite = {
            siteId,
            url,
            label: capitalizeFirstLetter(siteId),
            createdAt: new Date(),
            isActive: true
        }

        // Add the new tracked site to the user's list
        const { addTrackedSiteToUser } = await import('~/utils/db-utils.server')
        await addTrackedSiteToUser(user!, newTrackedSite)
    }

    return null
}

export default function UserPage({ loaderData }: Route.ComponentProps) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <PageHeader title={loaderData.user} subtitle="Your dashboard" backLink="/" backLabel="Back to home" />

                {/* Statistics Section */}
                <OverallStats
                    stats={{
                        streakDays: loaderData.stats.streakDays,
                        totalViews: loaderData.stats.views,
                        totalResists: loaderData.stats.resists,
                        totalFails: loaderData.stats.fails
                    }}
                />

                <div className="mb-8">
                    <Link
                        to="stats"
                        className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition"
                    >
                        View Detailed Statistics
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Available Sites</h2>
                    <ul className="space-y-2">
                        {loaderData.sites.map((siteId) => (
                            <li key={siteId}>
                                <Link to={siteId} className="text-indigo-600 hover:text-indigo-700 font-medium">
                                    {capitalizeFirstLetter(siteId)}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Add a New Site to Track</h2>
                    <Form method="post" className="space-y-4">
                        <input
                            type="text"
                            name="url"
                            placeholder="site url"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition cursor-pointer"
                        >
                            Add site
                        </button>
                    </Form>
                </div>
            </div>
        </div>
    )
}
