import { MongodbRepository, PaginatedQueryResult } from '@nindoo/mongodb-data-layer'
import { inject, injectable } from 'tsyringe'
import { Db } from 'mongodb'
import { Event } from '../../domain/event/Event'
import { SerializedEvent } from '../../domain/event/structures/SerializedEvent'

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
    return Event.create(_id, eventData)
  }

  async existsByDocument (document: string): Promise<boolean> {
    return this.existsBy({ document: document, deletedAt: null })
  }

  async getAll (): Promise<PaginatedQueryResult<Event>> {
    return this.runPaginatedQuery({ deletedAt: null })
  }
}
