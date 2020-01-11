import { PassThrough } from 'stream'
import { Db, ObjectId } from 'mongodb'
import { inject, injectable } from 'tsyringe'
import { Event } from '../../domain/event/Event'
import { Attendee, RSVPStates } from '../../domain/event/structures/Types'
import { SerializedEvent } from '../../domain/event/structures/SerializedEvent'
import { MongodbRepository, PaginatedQueryResult } from '@nindoo/mongodb-data-layer'
import { Nullable } from '../../utils/Nullable'

@injectable()
export class EventRepository extends MongodbRepository<Event, SerializedEvent> {
  static collection = 'events'
  constructor (@inject('MongodbConnection') connection: Db) {
    super(connection.collection(EventRepository.collection))
  }

  serialize (entity: Event): SerializedEvent {
    return entity.toObject()
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

  async getAll (page: number, size: number, publicOnly = true): Promise<PaginatedQueryResult<Event>> {
    const query: Record<string, any> = {
      deletedAt: null
    }

    if (publicOnly) {
      const now = new Date()
      now.setHours(0)
      now.setMinutes(0)
      now.setMilliseconds(0)

      query.publicSince = { $lte: now }
    }

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

  async deleteRSVPsByEmail (email: string){
    this.collection.update({}, 
      {$set: {
        'attendees.$[i].name': '',
        'attendees.$[i].email': '',
        'attendees.$[i].document': '',
        'attendees.$[i].inquiryResponses': [],
      }},
      {arrayFilters: [
        {'i.email': email}
      ]}
    )
  }
}
