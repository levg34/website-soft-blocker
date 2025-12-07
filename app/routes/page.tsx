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
        <div>
            <h1>
                Site {siteName} - <a href={'/' + loaderData.user}>{loaderData.user}</a>
            </h1>
            <button onClick={visitSite}>Visit {siteName}</button>
            <button onClick={stayFocused}>Stay focused</button>
        </div>
    )
}
