import { Db } from 'mongodb'
import { ObjectId } from 'bson'
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

  serialize (entity: Event) {
    return entity.toObject()
  }

  deserialize (data: SerializedEvent): Event {
    const { _id, ...groupData } = data
    return Event.create(_id, groupData)
  }

  async existsByName (name: string): Promise<boolean> {
    return this.existsBy({ name, deletedAt: null })
  }

  async getAll (page: number, size: number): Promise<PaginatedQueryResult<Event>> {
    return this.runPaginatedQuery({ deletedAt: null }, page, size)
  }

  async findManyById (communityIds: ObjectId[], page: number, size: number): Promise<PaginatedQueryResult<Event>> {
    return this.runPaginatedQuery({ _id: { $in: communityIds }, deletedAt: null }, page, size)
  }
}
