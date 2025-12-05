import { addPageLoad, getUrl } from '~/utils/utils.server'
import type { Route } from './+types/page'

export async function loader({ params }: Route.LoaderArgs) {
    const user = params.user
    const site = params.site
    await addPageLoad(user, site)
    const url = await getUrl(user, site)
    return { user, site, url }
}

export default function SitePage({ loaderData }: Route.ComponentProps) {
    const visitSite = async () => {
        // TODO: log the visit on the server side
        window.open(loaderData.url)
    }

    const stayFocused = async () => {
        // TODO: log the stay focused action on the server side
        alert('Stay focused! Closing the tab.')
        //  close the tab
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
