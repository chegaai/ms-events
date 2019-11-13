import { Db, ObjectId } from 'mongodb'
import { inject, injectable } from 'tsyringe'
import { Event } from '../../domain/event/Event'
import { SerializedEvent } from '../../domain/event/structures/SerializedEvent'
import { MongodbRepository, PaginatedQueryResult } from '@nindoo/mongodb-data-layer'

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

  async getAll (page: number, size: number): Promise<PaginatedQueryResult<Event>> {
    return this.runPaginatedQuery({ deletedAt: null }, page, size)
  }

  async listUpcoming (groupId: ObjectId, page: number, size: number) {
    const today = new Date()
    return this.runPaginatedQuery({ groups: { $in: [groupId] }, deletedAt: null, startAt: { $gte: today } }, page, size)
  }

  async listPast (groupId: ObjectId, page: number, size: number) {
    const today = new Date()
    return this.runPaginatedQuery({ groups: { $in: [groupId] }, deletedAt: null, startAt: { $lt: today } }, page, size)
  }
}
