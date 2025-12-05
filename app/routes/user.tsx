import { addPageLoad, getUserSites } from '~/utils/utils.server'
import type { Route } from './+types/user'
import { capitalizeFirstLetter } from '~/utils/utils'
import { Link } from 'react-router'

export async function loader({ params }: Route.LoaderArgs) {
    const user = params.user
    await addPageLoad(user)
    const sites = await getUserSites(user)
    return { user, sites }
}

export default function UserPage({ loaderData }: Route.ComponentProps) {
    return (
        <div>
            <h1>User Page - {loaderData.user}</h1>
            <h2>Available Sites</h2>
            <ul>
                {loaderData.sites.map((siteId) => (
                    <li>
                        <Link to={siteId}>{capitalizeFirstLetter(siteId)}</Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}
