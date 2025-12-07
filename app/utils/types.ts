import { ObjectId } from 'mongodb'

export type EventAction = 'view' | 'resist' | 'fail'

// users collection
export interface TrackedSite {
    siteId: string // e.g. "imgur"
    url: string // e.g. "https://imgur.com"
    label: string // human-friendly name
    createdAt: Date
    isActive: boolean
}

export interface UserDocument {
    _id: ObjectId
    username: string // unique per user
    email?: string
    createdAt: Date
    trackedSites: TrackedSite[]
}

// events collection
export interface EventDocument {
    _id: ObjectId

    username: string // foreign-key-ish reference to UserDocument.username
    siteId: string // matches TrackedSite.siteId
    timestamp: Date

    // "view"  = soft-block page shown
    // "resist" = user closes / stays focused
    // "fail" = user proceeds to real site
    action: EventAction

    // Optional metadata
    sessionId?: string
    userAgent?: string
    ipHash?: string
}
