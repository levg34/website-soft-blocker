import { recordEvent, getUserTrackedSite, getUserTrackedSites } from './db-utils.server'

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
        await recordEvent(username, siteId, 'view')
    }
    // Home page or guest page loads are not logged for now
}
