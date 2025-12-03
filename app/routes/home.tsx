import type { Route } from './+types/home'

export function meta({}: Route.MetaArgs) {
    return [
        { title: 'Website soft blocker' },
        { name: 'description', content: 'Website soft blocker! Mindful browsing.' }
    ]
}

export default function Home() {
    return <div>Home</div>
}
