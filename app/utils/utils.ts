export function capitalizeFirstLetter(str: string): string {
    if (str.length === 0) return str
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export function normalizeSiteUrl(raw: string): string {
    const u = new URL(raw)
    const hostname = u.hostname.replace(/^www\./, '').toLowerCase()
    const protocol = u.protocol.toLowerCase() // "https:"
    const pathname = u.pathname === '/' ? '' : u.pathname // no trailing slash for root
    return `${protocol}//${hostname}${pathname}`
}
