import {
    recordEvent,
    getUserTrackedSite,
    getUserTrackedSites,
    getSiteEvents,
    getUserByUsername
} from './db-utils.server'

/**
 * Increment the visit count for a user.
 * @param username the user who visits the page
 */
export async function addSiteVisit(username: string, siteId: string) {
    await recordEvent(username, siteId, 'fail')
}

export async function addStayeFocus(username: string, siteId: string) {
    await recordEvent(username, siteId, 'resist')
}

export async function getUserUrl(username: string, siteId: string): Promise<string | undefined> {
    const trackedSite = await getUserTrackedSite(username, siteId)
    return trackedSite?.url
}

export async function getUserSites(user: string): Promise<string[]> {
    const trackedSites = await getUserTrackedSites(user)
    return trackedSites.map((site: any) => site.siteId)
}

export async function addPageLoad(username?: string, siteId?: string): Promise<void> {
    if (username && siteId) {
        const user = await getUserByUsername(username)

        const userExists = !!user

        if (!userExists) {
            console.warn(`User ${username} does not exist. Skipping page load event recording.`)
            return
        }

        if (!user.trackedSites.map((s) => s.siteId).includes(siteId)) {
            console.warn(`Site ${siteId} is not tracked for user ${username}. Skipping page load event recording.`)
            return
        }

        try {
            const recent = await getSiteEvents(username, siteId, 1)
            if (recent && recent.length > 0) {
                const last = recent[0]
                const lastTs = last.timestamp ? new Date(last.timestamp).getTime() : 0
                const nowTs = Date.now()
                const diffMs = nowTs - lastTs

                if (diffMs < 1500 && (last.action === 'view' || last.action === 'resist' || last.action === 'fail')) {
                    // Do not record the site visit if there is a previous event (fail, resist, view) within 1.5s with the same username
                    // This is to prevent multiple page load events when React Router revalidates the route after an action
                    return
                }
            }
        } catch (err) {
            // If we fail to check recent events, fall back to recording the view to avoid losing data
            console.error('Failed to check recent events:', err)
        }

        await recordEvent(username, siteId, 'view')
    }
    // Home page or guest page loads are not logged for now
}
