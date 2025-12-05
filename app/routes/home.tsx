import { addPageLoad } from '~/utils/utils.server'
import type { Route } from './+types/home'
import { Link } from 'react-router'

export async function loader({ params }: Route.LoaderArgs) {
    await addPageLoad()
    return { loaded: true }
}

export default function Home({ loaderData }: Route.ComponentProps) {
    return (
        <div>
            <h1>Home</h1>
            <p>Welcome to the Website Soft Blocker!</p>
            <h2>Sample user</h2>
            <Link to="/test">Go to sample user page</Link>
        </div>
    )
}
