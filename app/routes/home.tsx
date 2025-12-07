import { addPageLoad } from '~/utils/utils.server'
import type { Route } from './+types/home'
import { Form, Link, redirect } from 'react-router'

export async function loader({ params }: Route.LoaderArgs) {
    await addPageLoad()
    return { loaded: true }
}

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData()
    const username = formData.get('username') as string

    if (username) {
        // No authentication for now, just redirect to user page
        return redirect(`/${username}`)
    }

    return null
}

export default function Home({ loaderData }: Route.ComponentProps) {
    return (
        <div>
            <h1>Home</h1>
            <p>Welcome to the Website Soft Blocker!</p>
            <h2>Sample user</h2>
            <Link to="/test">Go to sample user page</Link>
            <h2>Log in</h2>
            <Form method="post">
                <input name="username" type="text" placeholder="username" />
                <button>Log in</button>
            </Form>
        </div>
    )
}
