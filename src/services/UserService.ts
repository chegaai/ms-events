import { ObjectId } from 'bson'
import { injectable } from 'tsyringe'
import { PaginatedQueryResult } from '@nindoo/mongodb-data-layer'
import { EventRepository } from '../data/repositories/EventRepository'
import { EventNotFoundError } from '../domain/event/errors/EventNotFoundError'
import { EventAlreadyExistsError } from '../domain/event/errors/EventAlreadyExistsError'
import { Event } from '../domain/event/Event'
import { CreateEventData } from '../domain/event/structures/CreateEventData'

@injectable()
export class EventService {
  constructor (
    private readonly repository: EventRepository
  ) { }

  async create (creationData: CreateEventData): Promise<Event> {
    if (await this.repository.existsByDocument(creationData.document)) throw new EventAlreadyExistsError(creationData.document)

    // TODO: send the image to cloud

    const event: Event = Event.create(new ObjectId(), creationData)

    return this.repository.save(event)
  }

  async update (id: string, dataToUpdate: Partial<CreateEventData>): Promise<Event> {
    const event = await this.repository.findById(id)
    if (!event) throw new EventNotFoundError(id)

    const updatedData = {
      ...event.toObject(),
      ...dataToUpdate
    }

    event.update(updatedData)

    return this.repository.save(event)
  }

  async delete (id: string): Promise<void> {
    const event = await this.repository.findById(id)
    if (!event) return

    event.delete()

    await this.repository.save(event)
  }

  async find (id: string): Promise<Event> {
    const event = await this.repository.findById(id)

    if (!event) throw new EventNotFoundError(id)
    return event
  }

  async listAll (): Promise<PaginatedQueryResult<Event>> {
    return this.repository.getAll()
  }
}
