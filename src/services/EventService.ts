// import axios from 'axios'
import { ObjectId } from 'bson'
import { injectable } from 'tsyringe'
import { Event } from '../domain/event/Event'
import { UserClient } from '../data/repositories/UserClient'
import { PaginatedQueryResult } from '@nindoo/mongodb-data-layer'
import { EventRepository } from '../data/repositories/EventRepository'
import { CreateEventData } from '../domain/event/structures/CreateEventData'
import { OwnerNotFoundError } from '../domain/event/errors/OwnerNotFoundError'
import { EventNotFoundError } from '../domain/event/errors/EventNotFoundError'
import { OrganizerNotFoundError } from '../domain/event/errors/OrganizerNotFoundError'
import { GroupNotFoundError } from '../domain/event/errors/GroupNotFoundError'
import { GroupClient } from '../data/repositories/GroupClient'
import { UpdateEventData } from '../domain/event/structures/UpdateEventData'

@injectable()
export class EventService {
  constructor (
    private readonly repository: EventRepository,
    private readonly userClient: UserClient,
    private readonly groupClient: GroupClient
  ) { }

  async create (creationData: CreateEventData): Promise<Event> {
    await this.findOwner(creationData.owner as string)
    await Promise.all(creationData.groups.map(id => this.findGroup(id as string)))
    if (creationData.organizers) await Promise.all(creationData.organizers.map(id => this.findOrganizer(id as string)))

    const event = Event.create(new ObjectId(), creationData)

    return this.repository.save(event)
  }

  private async findOrganizer (organizerId: string) {
    const organizer = await this.userClient.findUserById(organizerId)
    if (!organizer) throw new OrganizerNotFoundError(organizerId)
    return organizer
  }

  private async findOwner (userId: string) {
    const user = await this.userClient.findUserById(userId)
    if (!user) throw new OwnerNotFoundError(userId)
    return user
  }

  private async findGroup (groupId: string) {
    const group = await this.groupClient.findGroupById(groupId)
    if (!group) throw new GroupNotFoundError(groupId)
    return group
  }

  async update (id: string, dataToUpdate: Partial<UpdateEventData>): Promise<Event> {
    const currentEvent = await this.repository.findById(id)
    if (!currentEvent) throw new EventNotFoundError(id)

    currentEvent.update(dataToUpdate)

    return this.repository.save(currentEvent)
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

  async listAll (page: number = 0, size: number = 10): Promise<PaginatedQueryResult<Event>> {
    return this.repository.getAll(page, size)
  }
}
