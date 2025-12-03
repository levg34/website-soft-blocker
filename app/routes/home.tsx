import type { Route } from './+types/home'

export async function loader({}: Route.LoaderArgs) {
    return { loaded: true }
}

export default function Home({ loaderData }: Route.ComponentProps) {
    return <div>Home {String(loaderData.loaded)}</div>
}
