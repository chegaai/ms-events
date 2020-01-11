import debug from 'debug'
import { PassThrough } from 'stream'
import { Db, ObjectId } from 'mongodb'
import { inject, injectable } from 'tsyringe'
import { Nullable } from '../../utils/Nullable'
import { Event } from '../../domain/event/Event'
import { Attendee, RSVPStates } from '../../domain/event/structures/Types'
import { QueryFieldMap, getQueryGenerator } from '../../utils/query-generator'
import { SerializedEvent } from '../../domain/event/structures/SerializedEvent'
import { MongodbRepository, PaginatedQueryResult } from '@nindoo/mongodb-data-layer'


const logQuery = debug('ms-events:data:repositories:queries')

export type EventQueryParams = {
  groupId?: string,
  unpublished?: string
}

const queryFieldMap: QueryFieldMap<EventQueryParams> = {
  groupId: {
    fieldName: 'groups',
    convert: (value) => ObjectId.isValid(value) ? new ObjectId(value) : null
  },
  unpublished: {
    fieldName: 'publicSince',
    convert: (value: 'true' | 'false') => {
      if (value === 'true') return null
      return { $lte: new Date() }
    }
  }
}

const generateQuery = getQueryGenerator<EventQueryParams>(queryFieldMap)

@injectable()
export class EventRepository extends MongodbRepository<Event, SerializedEvent> {
  static collection = 'events'
  constructor (@inject('MongodbConnection') connection: Db) {
    super(connection.collection(EventRepository.collection))
  }

  serialize (entity: Event): SerializedEvent {
    const { id, ...result } = entity.toObject()
    return { _id: id, ...result }
  }

  deserialize (data: SerializedEvent): Event {
    const { _id, ...eventData } = data

    const creationData = {
      ...eventData,
      owner: eventData.owner.toHexString(),
      organizers: eventData.organizers.map(user => user.toHexString()),
      groups: eventData.groups.map(group => group.toHexString())
    }

    return Event.create(_id, creationData)
  }

  async getAll (page: number, size: number, queryParams: EventQueryParams = {}): Promise<PaginatedQueryResult<Event>> {
    const query = generateQuery(
      queryParams,
      { deletedAt: null }
    )

    logQuery('Running paginated query: %o', query)

    return this.runPaginatedQuery(query, page, size)
  }

  private getUserOwnedQuery (userId: ObjectId) {
    return {
      $or: [
        { owner: userId },
        { organizers: { $in: [userId] } }
      ]
    }
  }

  async listUpcoming (groupId: ObjectId, userId: Nullable<ObjectId>, page: number, size: number) {
    const today = new Date()
    const belongsToUser = userId ? this.getUserOwnedQuery(userId) : {}
    return this.runPaginatedQuery({ ...belongsToUser, groups: { $in: [groupId] }, deletedAt: null, startAt: { $gte: today } }, page, size)
  }

  async listPast (groupId: ObjectId, userId: Nullable<ObjectId>, page: number, size: number) {
    const today = new Date()
    const belongsToUser = userId ? this.getUserOwnedQuery(userId) : {}
    return this.runPaginatedQuery({ ...belongsToUser, groups: { $in: [groupId] }, deletedAt: null, startAt: { $lt: today } }, page, size)
  }

  getRsvps (eventId: string | ObjectId, rsvpState: RSVPStates) {
    const attendeesStream = this.collection.aggregate<Attendee>([
      { $match: { _id: new ObjectId(eventId) } },
      { $unwind: '$attendees' },
      { $replaceRoot: { newRoot: '$attendees' } },
      { $match: { rsvp: rsvpState } }
    ], { cursor: { batchSize: 1 } })

    const resultStream = new PassThrough()

    attendeesStream.pipe(resultStream)

    return resultStream
  }
}
