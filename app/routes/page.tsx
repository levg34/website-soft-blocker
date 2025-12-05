import { addPageLoad, addSiteVisit, addStayeFocus, getUserUrl } from '~/utils/utils.server'
import type { Route } from './+types/page'
import { useFetcher } from 'react-router'

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
    return null
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

    return (
        <div>
            <h1>
                Site {loaderData.site} - {loaderData.user}
            </h1>
            <button onClick={visitSite}>Visit {loaderData.site}</button>
            <button onClick={stayFocused}>Stay focused</button>
        </div>
    )
}
