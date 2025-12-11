import { MongoClient, ObjectId } from 'mongodb'
import type { Db, Collection } from 'mongodb'
import type { UserDocument, EventDocument, TrackedSite, EventAction } from './types'
import { calculateStreakPeriods, getLongestStreak, getAverageStreak } from './calculations'

let mongoClient: MongoClient | null = null
let db: Db | null = null

const MONGO_URI = process.env.DB_URL || process.env.MONGODB_URI || ''
const DB_NAME = 'website_blocker'

/**
 * Connect to MongoDB and return the database instance.
 */
export async function getDatabase(): Promise<Db> {
    if (db) {
        return db
    }

    if (!MONGO_URI) {
        throw new Error('MongoDB connection string not found in DB_URL or MONGODB_URI')
    }

    mongoClient = new MongoClient(MONGO_URI)
    await mongoClient.connect()
    db = mongoClient.db(DB_NAME)
    return db
}

/**
 * Close the MongoDB connection.
 */
export async function closeDatabase(): Promise<void> {
    if (mongoClient) {
        await mongoClient.close()
        mongoClient = null
        db = null
    }
}

/**
 * Get the users collection.
 */
export async function getUsersCollection(): Promise<Collection<UserDocument>> {
    const database = await getDatabase()
    return database.collection('users')
}

/**
 * Get the events collection.
 */
export async function getEventsCollection(): Promise<Collection<EventDocument>> {
    const database = await getDatabase()
    return database.collection('events')
}

/**
 * Find or create a user by username.
 */
export async function findOrCreateUser(username: string): Promise<UserDocument> {
    const collection = await getUsersCollection()
    let user = await collection.findOne({ username })

    if (!user) {
        const result = await collection.insertOne({
            _id: new ObjectId(),
            username,
            createdAt: new Date(),
            trackedSites: []
        } as UserDocument)

        user = await collection.findOne({ _id: result.insertedId })
        if (!user) {
            throw new Error(`Failed to create user: ${username}`)
        }
    }

    return user
}

/**
 * Get a user by username.
 */
// export async function getUserByUsername(username: string): Promise<UserDocument | null> {
//     const collection = await getUsersCollection()
//     return collection.findOne({ username })
// }

/**
 * Add a tracked site to a user's list.
 */
export async function addTrackedSiteToUser(username: string, trackedSite: TrackedSite): Promise<UserDocument | null> {
    const collection = await getUsersCollection()
    const result = await collection.findOneAndUpdate(
        { username },
        { $push: { trackedSites: trackedSite } },
        { returnDocument: 'after' }
    )
    return result || null
}

/**
 * Get all tracked sites for a user.
 */
export async function getUserTrackedSites(username: string): Promise<TrackedSite[]> {
    const user = await findOrCreateUser(username)
    return user?.trackedSites || []
}

/**
 * Get a specific tracked site for a user.
 */
export async function getUserTrackedSite(username: string, siteId: string): Promise<TrackedSite | undefined> {
    const user = await findOrCreateUser(username)
    return user?.trackedSites.find((site) => site.siteId === siteId)
}

/**
 * Record an event (view, resist, or fail).
 */
export async function recordEvent(
    username: string,
    siteId: string,
    action: EventAction,
    metadata?: {
        sessionId?: string
        userAgent?: string
        ipHash?: string
    }
): Promise<ObjectId> {
    const collection = await getEventsCollection()
    const result = await collection.insertOne({
        _id: new ObjectId(),
        username,
        siteId,
        timestamp: new Date(),
        action,
        ...metadata
    } as EventDocument)
    return result.insertedId
}

/**
 * Get all events for a user.
 */
export async function getUserEvents(username: string, limit?: number): Promise<EventDocument[]> {
    const collection = await getEventsCollection()
    const query = collection.find({ username }).sort({ timestamp: -1 })

    if (limit) {
        query.limit(limit)
    }

    return query.toArray()
}

/**
 * Get events for a specific site and user.
 */
export async function getSiteEvents(username: string, siteId: string, limit?: number): Promise<EventDocument[]> {
    const collection = await getEventsCollection()
    const query = collection.find({ username, siteId }).sort({ timestamp: -1 })

    if (limit) {
        query.limit(limit)
    }

    return query.toArray()
}

/**
 * Get event statistics for a user.
 */
export async function getUserEventStats(username: string): Promise<{ views: number; resists: number; fails: number }> {
    const collection = await getEventsCollection()
    const pipeline = [
        { $match: { username } },
        {
            $group: {
                _id: '$action',
                count: { $sum: 1 }
            }
        }
    ]

    const results = await collection.aggregate(pipeline).toArray()
    const stats = { views: 0, resists: 0, fails: 0 }

    for (const doc of results) {
        if (doc._id === 'view') stats.views = doc.count
        if (doc._id === 'resist') stats.resists = doc.count
        if (doc._id === 'fail') stats.fails = doc.count
    }

    return stats
}

/**
 * Get event statistics for a specific site and user.
 */
export async function getSiteEventStats(
    username: string,
    siteId: string
): Promise<{ views: number; resists: number; fails: number }> {
    const collection = await getEventsCollection()
    const pipeline = [
        { $match: { username, siteId } },
        {
            $group: {
                _id: '$action',
                count: { $sum: 1 }
            }
        }
    ]

    const results = await collection.aggregate(pipeline).toArray()
    const stats = { views: 0, resists: 0, fails: 0 }

    for (const doc of results) {
        if (doc._id === 'view') stats.views = doc.count
        if (doc._id === 'resist') stats.resists = doc.count
        if (doc._id === 'fail') stats.fails = doc.count
    }

    return stats
}

/**
 * Get user statistics including streak (days since last failure).
 */
export async function getUserStats(username: string): Promise<{
    views: number
    resists: number
    fails: number
    streakDays: number
    lastFailureDate: Date | null
}> {
    const stats = await getUserEventStats(username)
    const collection = await getEventsCollection()

    // Get the last failure event timestamp (for display)
    const lastFailure = await collection.findOne({ username, action: 'fail' }, { sort: { timestamp: -1 } })
    let lastFailureDate: Date | null = lastFailure ? lastFailure.timestamp : null

    // Compute streakDays using the streak-calculation logic so it's consistent
    // with getUserStreakStats/currentStreak shown in detailed stats.
    const streakStats = await getUserStreakStats(username)
    let streakDays = streakStats.currentStreak || 0

    return {
        ...stats,
        streakDays,
        lastFailureDate
    }
}

/**
 * Get extended streak statistics for a user
 */
export async function getUserStreakStats(username: string): Promise<{
    currentStreak: number
    longestStreak: number
    averageStreak: number
    totalStreaks: number
}> {
    const collection = await getEventsCollection()

    // Get all events sorted by timestamp
    const events = await collection.find({ username }).sort({ timestamp: 1 }).toArray()

    if (events.length === 0) {
        return {
            currentStreak: 0,
            longestStreak: 0,
            averageStreak: 0,
            totalStreaks: 0
        }
    }

    // Calculate streaks using the new function (calendar days without failures)
    const streaks = calculateStreakPeriods(events)

    // Calculate stats from streaks
    const longestStreak = getLongestStreak(streaks)
    const averageStreak = getAverageStreak(streaks)
    const currentStreak = streaks.length > 0 ? streaks[streaks.length - 1].days : 0

    return {
        currentStreak,
        longestStreak,
        averageStreak,
        totalStreaks: streaks.length
    }
}

/**
 * Get detailed statistics for a user including daily activity.
 */
export async function getUserDetailedStats(username: string): Promise<{
    totalViews: number
    totalResists: number
    totalFails: number
    streakDays: number
    currentStreak: number
    longestStreak: number
    averageStreak: number
    totalStreaks: number
    lastFailureDate: Date | null
    visitsPerDay: number
    resistsPerDay: number
    failsPerDay: number
    avgViewsLast15Days: number
    avgResistsLast15Days: number
    avgFailsLast15Days: number
    siteStats: Array<{
        siteId: string
        views: number
        resists: number
        fails: number
        streakDays: number
        visitsPerDay: number
        failsPerDay: number
        daysTracked: number
    }>
    dailyActivity: Array<{
        date: string
        views: number
        resists: number
        fails: number
    }>
}> {
    const collection = await getEventsCollection()
    const stats = await getUserStats(username)
    const streakStats = await getUserStreakStats(username)
    const trackedSites = await getUserTrackedSites(username)

    // Get stats per site
    const siteStats = []
    for (const site of trackedSites) {
        const enhancedStats = await getEnhancedSiteStats(username, site.siteId)
        siteStats.push({
            siteId: site.siteId,
            views: enhancedStats.views,
            resists: enhancedStats.resists,
            fails: enhancedStats.fails,
            streakDays: enhancedStats.streakDays,
            visitsPerDay: enhancedStats.visitsPerDay,
            failsPerDay: enhancedStats.failsPerDay,
            daysTracked: enhancedStats.daysTracked
        })
    }

    // Get daily activity for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const pipeline = [
        {
            $match: {
                username,
                timestamp: { $gte: thirtyDaysAgo }
            }
        },
        {
            $group: {
                _id: {
                    date: {
                        $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
                    },
                    action: '$action'
                },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { '_id.date': 1 }
        }
    ]

    const dailyRaw = await collection.aggregate(pipeline).toArray()

    // Transform daily activity data
    const dailyActivityMap: Record<string, { date: string; views: number; resists: number; fails: number }> = {}

    for (const entry of dailyRaw) {
        const date = entry._id.date
        if (!dailyActivityMap[date]) {
            dailyActivityMap[date] = { date, views: 0, resists: 0, fails: 0 }
        }

        if (entry._id.action === 'view') dailyActivityMap[date].views = entry.count
        if (entry._id.action === 'resist') dailyActivityMap[date].resists = entry.count
        if (entry._id.action === 'fail') dailyActivityMap[date].fails = entry.count
    }

    const dailyActivity = Object.values(dailyActivityMap)

    // Calculate metrics for different periods
    const allTimeMetrics = calculatePeriodMetrics(dailyActivity)
    const fifteenDaysAgo = new Date()
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15)
    const last15DaysActivity = dailyActivity.filter((day) => new Date(day.date) >= fifteenDaysAgo)
    const last15DaysMetrics = calculatePeriodMetrics(last15DaysActivity)

    return {
        totalViews: stats.views,
        totalResists: stats.resists,
        totalFails: stats.fails,
        streakDays: stats.streakDays,
        currentStreak: streakStats.currentStreak,
        longestStreak: streakStats.longestStreak,
        averageStreak: streakStats.averageStreak,
        totalStreaks: streakStats.totalStreaks,
        lastFailureDate: stats.lastFailureDate,
        visitsPerDay: allTimeMetrics.avgViews,
        resistsPerDay: allTimeMetrics.avgResists,
        failsPerDay: allTimeMetrics.avgFails,
        avgViewsLast15Days: last15DaysMetrics.avgViews,
        avgResistsLast15Days: last15DaysMetrics.avgResists,
        avgFailsLast15Days: last15DaysMetrics.avgFails,
        siteStats,
        dailyActivity
    }
}

/**
 * Get site statistics including streak (days since last failure for a specific site).
 */
export async function getSiteStats(
    username: string,
    siteId: string
): Promise<{
    views: number
    resists: number
    fails: number
    streakDays: number
    lastFailureDate: Date | null
}> {
    const stats = await getSiteEventStats(username, siteId)
    const collection = await getEventsCollection()

    // Get the last failure event for this specific site
    const lastFailure = await collection.findOne({ username, siteId, action: 'fail' }, { sort: { timestamp: -1 } })

    let streakDays = 0
    let lastFailureDate = null

    if (lastFailure) {
        lastFailureDate = lastFailure.timestamp
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - lastFailure.timestamp.getTime())
        streakDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    } else {
        // If no failure for this site, calculate days since first view of this site
        const firstView = await collection.findOne({ username, siteId }, { sort: { timestamp: 1 } })

        if (firstView) {
            const now = new Date()
            const diffTime = Math.abs(now.getTime() - firstView.timestamp.getTime())
            streakDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        }
    }

    return {
        ...stats,
        streakDays,
        lastFailureDate
    }
}

/**
 * Get extended streak statistics for a site
 */
export async function getSiteStreakStats(
    username: string,
    siteId: string
): Promise<{
    currentStreak: number
    longestStreak: number
    averageStreak: number
    totalStreaks: number
}> {
    const collection = await getEventsCollection()

    // Get all events for this site sorted by timestamp
    const events = await collection.find({ username, siteId }).sort({ timestamp: 1 }).toArray()

    if (events.length === 0) {
        return {
            currentStreak: 0,
            longestStreak: 0,
            averageStreak: 0,
            totalStreaks: 0
        }
    }

    // Calculate streaks using the new function (calendar days without failures)
    const streaks = calculateStreakPeriods(events)

    // Calculate stats from streaks
    const longestStreak = getLongestStreak(streaks)
    const averageStreak = getAverageStreak(streaks)
    const currentStreak = streaks.length > 0 ? streaks[streaks.length - 1].days : 0

    return {
        currentStreak,
        longestStreak,
        averageStreak,
        totalStreaks: streaks.length
    }
}

/**
 * Get enhanced site statistics with date range info and visits per day.
 */
export async function getEnhancedSiteStats(
    username: string,
    siteId: string
): Promise<{
    views: number
    resists: number
    fails: number
    streakDays: number
    lastFailureDate: Date | null
    firstVisitDate: Date | null
    lastVisitDate: Date | null
    visitsPerDay: number
    failsPerDay: number
    daysTracked: number
}> {
    const stats = await getSiteStats(username, siteId)
    const collection = await getEventsCollection()

    // Get first and last event dates
    const firstEvent = await collection.findOne({ username, siteId }, { sort: { timestamp: 1 } })
    const lastEvent = await collection.findOne({ username, siteId }, { sort: { timestamp: -1 } })

    let firstVisitDate = null
    let lastVisitDate = null
    let daysTracked = 0
    let visitsPerDay = 0
    let failsPerDay = 0

    if (firstEvent && lastEvent) {
        firstVisitDate = firstEvent.timestamp
        lastVisitDate = lastEvent.timestamp

        const diffTime = Math.abs(lastEvent.timestamp.getTime() - firstEvent.timestamp.getTime())
        daysTracked = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1 // +1 to include the first day
        visitsPerDay = daysTracked > 0 ? parseFloat((stats.views / daysTracked).toFixed(2)) : 0
        failsPerDay = daysTracked > 0 ? parseFloat((stats.fails / daysTracked).toFixed(2)) : 0
    }

    return {
        views: stats.views,
        resists: stats.resists,
        fails: stats.fails,
        streakDays: stats.streakDays,
        lastFailureDate: stats.lastFailureDate,
        firstVisitDate,
        lastVisitDate,
        visitsPerDay,
        failsPerDay,
        daysTracked
    }
}

/**
 * Calculate detailed activity metrics for a period
 */
function calculatePeriodMetrics(dailyActivity: Array<{ views: number; resists: number; fails: number }>): {
    totalViews: number
    totalResists: number
    totalFails: number
    avgViews: number
    avgResists: number
    avgFails: number
} {
    if (dailyActivity.length === 0) {
        return { totalViews: 0, totalResists: 0, totalFails: 0, avgViews: 0, avgResists: 0, avgFails: 0 }
    }

    const totalViews = dailyActivity.reduce((sum, day) => sum + day.views, 0)
    const totalResists = dailyActivity.reduce((sum, day) => sum + day.resists, 0)
    const totalFails = dailyActivity.reduce((sum, day) => sum + day.fails, 0)

    return {
        totalViews,
        totalResists,
        totalFails,
        avgViews: parseFloat((totalViews / dailyActivity.length).toFixed(2)),
        avgResists: parseFloat((totalResists / dailyActivity.length).toFixed(2)),
        avgFails: parseFloat((totalFails / dailyActivity.length).toFixed(2))
    }
}

/**
 * Get detailed statistics for a specific site including daily activity.
 */
export async function getSiteDetailedStats(
    username: string,
    siteId: string
): Promise<{
    views: number
    resists: number
    fails: number
    streakDays: number
    currentStreak: number
    longestStreak: number
    averageStreak: number
    totalStreaks: number
    lastFailureDate: Date | null
    visitsPerDay: number
    resistsPerDay: number
    failsPerDay: number
    avgViewsLast15Days: number
    avgResistsLast15Days: number
    avgFailsLast15Days: number
    daysTracked: number
    dailyActivity: Array<{
        date: string
        views: number
        resists: number
        fails: number
    }>
}> {
    const collection = await getEventsCollection()
    const enhancedStats = await getEnhancedSiteStats(username, siteId)
    const streakStats = await getSiteStreakStats(username, siteId)

    // Get daily activity for this site (all time)
    const pipeline = [
        {
            $match: {
                username,
                siteId
            }
        },
        {
            $group: {
                _id: {
                    date: {
                        $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
                    },
                    action: '$action'
                },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { '_id.date': 1 }
        }
    ]

    const dailyRaw = await collection.aggregate(pipeline).toArray()

    // Transform daily activity data
    const dailyActivityMap: Record<string, { date: string; views: number; resists: number; fails: number }> = {}

    for (const entry of dailyRaw) {
        const date = entry._id.date
        if (!dailyActivityMap[date]) {
            dailyActivityMap[date] = { date, views: 0, resists: 0, fails: 0 }
        }

        if (entry._id.action === 'view') dailyActivityMap[date].views = entry.count
        if (entry._id.action === 'resist') dailyActivityMap[date].resists = entry.count
        if (entry._id.action === 'fail') dailyActivityMap[date].fails = entry.count
    }

    const dailyActivity = Object.values(dailyActivityMap)

    // Calculate metrics for different periods
    const allTimeMetrics = calculatePeriodMetrics(dailyActivity)
    const fifteenDaysAgo = new Date()
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15)
    const last15DaysActivity = dailyActivity.filter((day) => new Date(day.date) >= fifteenDaysAgo)
    const last15DaysMetrics = calculatePeriodMetrics(last15DaysActivity)

    return {
        views: enhancedStats.views,
        resists: enhancedStats.resists,
        fails: enhancedStats.fails,
        streakDays: enhancedStats.streakDays,
        currentStreak: streakStats.currentStreak,
        longestStreak: streakStats.longestStreak,
        averageStreak: streakStats.averageStreak,
        totalStreaks: streakStats.totalStreaks,
        lastFailureDate: enhancedStats.lastFailureDate,
        visitsPerDay: allTimeMetrics.avgViews,
        resistsPerDay: allTimeMetrics.avgResists,
        failsPerDay: allTimeMetrics.avgFails,
        avgViewsLast15Days: last15DaysMetrics.avgViews,
        avgResistsLast15Days: last15DaysMetrics.avgResists,
        avgFailsLast15Days: last15DaysMetrics.avgFails,
        daysTracked: enhancedStats.daysTracked,
        dailyActivity
    }
}
