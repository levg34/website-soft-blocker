import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
    index('routes/home.tsx'),
    route('/:user', 'routes/user.tsx'),
    route('/:user/stats', 'routes/stats.tsx'),
    route('/:user/stats/:site', 'routes/site-stats.tsx'),
    route('/:user/:site', 'routes/page.tsx')
] satisfies RouteConfig
