import { addPageLoad, getUserSites } from '~/utils/utils.server'
import type { Route } from './+types/user'
import { capitalizeFirstLetter } from '~/utils/utils'
import { Form, Link } from 'react-router'

export async function loader({ params }: Route.LoaderArgs) {
    const user = params.user
    await addPageLoad(user)
    const sites = await getUserSites(user)
    return { user, sites }
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
            <h2>Add a New Site to Track</h2>
            <Form method="post">
                <input type="text" name="url" placeholder="site url" />
                <button type="submit">Add site</button>
            </Form>
            <p>
                <a href="/">Home</a>
            </p>
        </div>
    )
}
