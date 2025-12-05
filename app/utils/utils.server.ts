/**
 * Increment the visit count for a user.
 * @param username the user who visits the page
 */
export async function addSiteVisit(username: string, siteId: string) {
    // TODO: database logic to record the visit
    console.log(`User ${username} visited the page ${siteId}.`)
}

export async function addStayeFocus(username: string, siteId: string) {}

export async function getUrl(siteId: string): Promise<string> {
    // TODO: implement URL retrieval logic
    return 'https://imgur.com'
}

export async function addPageLoad(username?: string, siteId?: string): Promise<void> {}
