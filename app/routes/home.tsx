import { addPageLoad } from '~/utils/utils.server'
import type { Route } from './+types/home'

export async function loader({ params }: Route.LoaderArgs) {
    await addPageLoad()
    return { loaded: true }
}

export default function Home({ loaderData }: Route.ComponentProps) {
    return <div>Home</div>
}
