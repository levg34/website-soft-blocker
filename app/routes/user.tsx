import { addVisit } from '~/utils/utils.server'
import type { Route } from './+types/user'

export async function loader({ params }: Route.LoaderArgs) {
    const user = params.user
    await addVisit(user)
    return { user }
}

export default function UserPage({ loaderData }: Route.ComponentProps) {
    return <div>User {loaderData.user} Page</div>
}
