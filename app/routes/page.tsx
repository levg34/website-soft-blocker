import { addPageLoad, addSiteVisit, addStayeFocus, getUserUrl } from '~/utils/utils.server'
import type { Route } from './+types/page'
import { useFetcher } from 'react-router'
import { capitalizeFirstLetter } from '~/utils/utils'

export async function loader({ params }: Route.LoaderArgs) {
    const user = params.user
    const site = params.site
    await addPageLoad(user, site)
    const url = await getUserUrl(user, site)
    return { user, site, url }
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
                <h1 className="text-4xl font-bold text-gray-900 mb-8">
                    Site {siteName} -{' '}
                    <a href={'/' + loaderData.user} className="text-indigo-600 hover:text-indigo-700">
                        {loaderData.user}
                    </a>
                </h1>

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
