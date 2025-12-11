import { addPageLoad } from '~/utils/utils.server'
import { getAllStreakBadges } from '~/utils/badges.server'
import { BadgeCard } from '~/components'
import { useState } from 'react'
import type { Route } from './+types/home'
import { Form, Link, redirect } from 'react-router'

export async function loader({ params }: Route.LoaderArgs) {
    await addPageLoad()
    const allBadges = await getAllStreakBadges()
    return { loaded: true, allBadges }
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
    const [showBadges, setShowBadges] = useState(false)

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Home</h1>
                <p className="text-lg text-gray-600 mb-12">Welcome to the Website Soft Blocker!</p>

                <div className="flex gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Sample user</h2>
                        <Link
                            to="/test"
                            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition"
                        >
                            Go to sample user page
                        </Link>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-8 flex items-center">
                        <button
                            onClick={() => setShowBadges(true)}
                            className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition"
                        >
                            View badges
                        </button>
                    </div>
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

                {showBadges ? (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black opacity-40" onClick={() => setShowBadges(false)} />
                        <div className="bg-white rounded-lg shadow-xl p-6 z-10 max-w-3xl w-full">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold">All badges (streak)</h3>
                                <button onClick={() => setShowBadges(false)} className="text-gray-600">
                                    Close
                                </button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {loaderData.allBadges?.map((b: any) => (
                                    <BadgeCard key={b.id} badge={b} />
                                ))}
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    )
}
