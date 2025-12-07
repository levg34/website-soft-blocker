import { MongoClient, Db, Collection, ObjectId } from 'mongodb'
import type { UserDocument, EventDocument, TrackedSite, EventAction } from './types'

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
