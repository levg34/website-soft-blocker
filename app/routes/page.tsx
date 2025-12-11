import { addPageLoad, addSiteVisit, addStayeFocus, getUserUrl } from '~/utils/utils.server'
import type { Route } from './+types/page'
import { useFetcher, Link } from 'react-router'
import { capitalizeFirstLetter } from '~/utils/utils'
import { getSiteStats } from '~/utils/db-utils.server'

export async function loader({ params }: Route.LoaderArgs) {
    const user = params.user
    const site = params.site
    await addPageLoad(user, site)
    const url = await getUserUrl(user, site)
    const stats = await getSiteStats(user, site)
    return { user, site, url, stats }
}

export async function action({ params, request }: Route.ActionArgs) {
    const user = params.user
    const site = params.site
    const formData = await request.formData()
    const actionType = formData.get('action')
    if (actionType === 'visit') {
        await addSiteVisit(user!, site!)
    } else if (actionType === 'stay') {
        await addStayeFocus(user!, site!)
    }
    return actionType
}

export default function SitePage({ loaderData }: Route.ComponentProps) {
    const fetcher = useFetcher()

    const visitSite = async () => {
        await fetcher.submit({ action: 'visit' }, { method: 'post' })
        window.open(loaderData.url)
    }

    const stayFocused = async () => {
        await fetcher.submit({ action: 'stay' }, { method: 'post' })
        alert('Stay focused! Closing the tab.')
        window.close()
    }

    const siteName = capitalizeFirstLetter(loaderData.site)

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">{siteName}</h1>
                        <p className="text-lg text-gray-600 mt-2">{loaderData.user}'s focus page</p>
                    </div>
                    <Link to={`/${loaderData.user}`} className="text-indigo-600 hover:text-indigo-700 font-medium">
                        Back to user page
                    </Link>
                </div>

                {/* Site Statistics */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="text-3xl font-bold text-indigo-600">{loaderData.stats.streakDays}</div>
                        <div className="text-sm text-gray-600 mt-2">Days Streak</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="text-3xl font-bold text-blue-600">{loaderData.stats.views}</div>
                        <div className="text-sm text-gray-600 mt-2">Times Viewed</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="text-3xl font-bold text-green-600">{loaderData.stats.resists}</div>
                        <div className="text-sm text-gray-600 mt-2">Times Resisted</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="text-3xl font-bold text-red-600">{loaderData.stats.fails}</div>
                        <div className="text-sm text-gray-600 mt-2">Times Failed</div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-8 flex gap-4">
                    <button
                        onClick={visitSite}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition cursor-pointer"
                    >
                        Visit {siteName}
                    </button>
                    <button
                        onClick={stayFocused}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition cursor-pointer"
                    >
                        Stay focused
                    </button>
                </div>
            </div>
        </div>
    )
}
