// import axios from 'axios'
import { ObjectId } from 'bson'
import { injectable } from 'tsyringe'
import { Event } from '../domain/event/Event'
import { UserClient } from '../data/repositories/UserClient'
import { PaginatedQueryResult } from '@nindoo/mongodb-data-layer'
import { EventRepository } from '../data/repositories/EventRepository'
import { CreateEventData } from '../domain/event/structures/CreateEventData'
import { UserNotFoundError } from '../domain/event/errors/UserNotFoundError'
import { GroupNotFoundError } from '../domain/event/errors/GroupNotFoundError'
import { FounderNotFoundError } from '../domain/event/errors/FounderNotFoundError'
import { OrganizerNotFoundError } from '../domain/event/errors/OrganizerNotFoundError'
import { GroupAlreadyExistsError } from '../domain/event/errors/GroupAlreadyExistsError'

@injectable()
export class EventService {
  constructor (
    private readonly repository: EventRepository,
    private readonly userClient: UserClient
  ) { }

  async create (creationData: CreateEventData): Promise<Event> {
    if (await this.repository.existsByName(creationData.name)) throw new GroupAlreadyExistsError(creationData.name)

    await this.findFounder(creationData.founder as string)

    if (creationData.organizers) {
      await Promise.all(creationData.organizers.map(id => this.findOrganizer(id as string)))
    }

    const group = Event.create(new ObjectId(), creationData)

    return this.repository.save(group)
  }

  async searchByFollowedUser (userId: string, page: number = 0, size: number = 10) {
    const user = await this.findUser(userId)
    const communityIds = user.groups.map((groupId: string) => new ObjectId(groupId))
    return this.repository.findManyById(communityIds, page, size)
  }

  private async findOrganizer (organizerId: string) {
    const organizer = await this.userClient.findUserById(organizerId)
    if (!organizer) throw new OrganizerNotFoundError(organizerId)
    return organizer
  }

  private async findFounder (founderId: string) {
    const founder = await this.userClient.findUserById(founderId)
    if (!founder) throw new FounderNotFoundError(founderId)
    return founder
  }

  private async findUser (userId: string) {
    const user = await this.userClient.findUserById(userId)
    if (!user) throw new UserNotFoundError(userId)
    return user
  }

  async update (id: string, dataToUpdate: Partial<CreateEventData>): Promise<Event> {
    const currentGroup = await this.repository.findById(id)
    if (!currentGroup) throw new GroupNotFoundError(id)

    const newGroup = {
      ...currentGroup,
      ...dataToUpdate
    }

    currentGroup.update(newGroup)

    return this.repository.save(currentGroup)
  }

  async delete (id: string): Promise<void> {
    const group = await this.repository.findById(id)
    if (!group) return

    group.delete()

    await this.repository.save(group)
  }

  async find (id: string): Promise<Event> {
    const group = await this.repository.findById(id)

    if (!group) throw new GroupNotFoundError(id)
    return group
  }

  async listAll (page: number = 0, size: number = 10): Promise<PaginatedQueryResult<Event>> {
    return this.repository.getAll(page, size)
  }
}
