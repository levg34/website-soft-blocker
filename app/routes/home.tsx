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
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Home</h1>
                <p className="text-lg text-gray-600 mb-12">Welcome to the Website Soft Blocker!</p>

                <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Sample user</h2>
                    <Link
                        to="/test"
                        className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition"
                    >
                        Go to sample user page
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow-md p-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Log in</h2>
                    <Form method="post" className="space-y-4">
                        <input
                            name="username"
                            type="text"
                            placeholder="username"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition cursor-pointer">
                            Log in
                        </button>
                    </Form>
                </div>
            </div>
        </div>
    )
}
