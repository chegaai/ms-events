// import axios from 'axios'
import { ObjectId } from 'bson'
import { JWT } from '../utils/JWT'
import { injectable } from 'tsyringe'
import { Readable, Transform } from 'stream'
import { Nullable } from '../utils/Nullable'
import { Event } from '../domain/event/Event'
import { UserClient } from '../data/clients/UserClient'
import { GroupClient } from '../data/clients/GroupClient'
import { PaginatedQueryResult } from '@nindoo/mongodb-data-layer'
import { BlobStorageClient } from '../data/clients/BlobStorageClient'
import { CreateEventData } from '../domain/event/structures/CreateEventData'
import { UpdateEventData } from '../domain/event/structures/UpdateEventData'
import { InvalidOwnerError } from '../domain/event/errors/InvalidOwnerError'
import { UserNotFoundError } from '../domain/event/errors/UserNotFoundError'
import { OwnerNotFoundError } from '../domain/event/errors/OwnerNotFoundError'
import { EventNotFoundError } from '../domain/event/errors/EventNotFoundError'
import { GroupNotFoundError } from '../domain/event/errors/GroupNotFoundError'
import { Attendee, AgendaSlot, RSVPStates, AttendeeResponse } from '../domain/event/structures/Types'
import { EventRepository, EventQueryParams } from '../data/repositories/EventRepository'
import { OrganizerNotFoundError } from '../domain/event/errors/OrganizerNotFoundError'
import { InvalidTokenError } from './errors/InvalidTokenError'
import { RemoveNotLoggedRSVPTemplate } from '../data/clients/mail-templates/RemoveNotLoggedRSVPTemplate'
import { MailClient } from '../data/clients/MailClient'

export enum UserTypes {
  USER,
  ORGANIZER,
  OWNER
}

function validateRsvpState (state: any): state is RSVPStates {
  return Object.values(RSVPStates).includes(state)
}

function validateTokenPayload (payload: { sub?: string, action?: string, eventId?: string } | string, expectedAction: string) {
  if (typeof payload === 'string') throw new InvalidTokenError(payload)
  const { sub, action, eventId } = payload as { sub?: string, action?: string, eventId?: string }

  if (!sub || !action || !eventId) throw new InvalidTokenError('token have missing properties')
  if (action !== expectedAction) throw new InvalidTokenError(`token action (${action}) is invalid`)
  if (!ObjectId.isValid(eventId)) throw new InvalidTokenError(`token eventId (${eventId}) is invalid`)
  
  return { sub, action, eventId }
}

@injectable()
export class EventService {
  constructor (
    private readonly repository: EventRepository,
    private readonly userClient: UserClient,
    private readonly blobStorageClient: BlobStorageClient,
    private readonly groupClient: GroupClient,
    private readonly mailClient: MailClient,
    private readonly jwt: JWT
  ) { }

  private async uploadBase64 (base64: string) {
    const url = await this.blobStorageClient.uploadBase64(base64, 'image/*')
    if (!url)
      throw Error() //TODO: throw better error handler
    return url
  }

  async create (owner: string, creationData: CreateEventData): Promise<Event> {
    await this.findUser(owner as string, UserTypes.OWNER)
    const groups = await Promise.all(creationData.groups.map(id => this.findGroup(id as string)))

    const foundersAndOrganizers: string[] = groups
      .map((group) => [group.founder, ...group.organizers]).flat()

    if (!foundersAndOrganizers.includes(owner)) throw new InvalidOwnerError(owner)
    if (creationData.organizers) await Promise.all(creationData.organizers.map(id => this.findUser(id as string, UserTypes.ORGANIZER)))

    if (creationData.banner) creationData.banner = await this.uploadBase64(creationData.banner)
    const event = Event.create(new ObjectId(), { ...creationData, owner })

    return this.repository.save(event)
  }

  async moveToList (founderOrOrganizerId: string, eventId: string, userEmails: string[], list: RSVPStates) {
    const event = await this.find(eventId)
    await this.findUser(founderOrOrganizerId, UserTypes.USER)

    event.moveToList(new ObjectId(founderOrOrganizerId), userEmails, list)

    await this.repository.save(event)
    return event
  }

  private async findUser (userId: string, userType: UserTypes = UserTypes.USER) {
    const user = await this.userClient.findUserById(userId)
    if (!user) {
      switch (userType) {
        case UserTypes.OWNER:
          throw new OwnerNotFoundError(userId)
        case UserTypes.ORGANIZER:
          throw new OrganizerNotFoundError(userId)
        default:
          throw new UserNotFoundError(userId)
      }
    }
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
    if (dataToUpdate.pictures) await Promise.all(dataToUpdate.pictures.map(async (picture) => {
      picture.link = await this.uploadBase64(picture.link)
      return picture
    }))

    if (dataToUpdate.banner)
      dataToUpdate.banner = await this.uploadBase64(dataToUpdate.banner)

    return this.repository.save(currentEvent)
  }

  async delete (id: string): Promise<void> {
    const event = await this.repository.findById(id)
    if (!event) return

    event.delete()

    await this.repository.save(event)
  }

  async listUpcoming (groupId: string, userId: Nullable<string>, page: number = 0, size: number = 10) {
    const group = await this.findGroup(groupId)
    const ownerId = userId ? new ObjectId(await this.findUser(userId)) : null
    return this.repository.listUpcoming(group.id, ownerId, page, size)
  }

  async listPast (groupId: string, userId: Nullable<string>, page: number = 0, size: number = 10) {
    const group = await this.findGroup(groupId)
    const ownerId = userId ? new ObjectId(await this.findUser(userId)) : null
    return this.repository.listPast(group.id, ownerId, page, size)
  }

  async addRSVP (eventId: string, rsvpData: Partial<Attendee>) {
    const event = await this.find(eventId)
    
    const user = (rsvpData.userId) 
      ? await this.userClient.findUserById(rsvpData.userId) 
      : { ...rsvpData }

    const attendee = {
      userId: (rsvpData.userId) ? rsvpData.userId : null,
      name: user.name,
      email: user.email,
      document: user.document,
      timestamp: new Date(),
      inquiryResponses: rsvpData.inquiryResponses as AttendeeResponse[],
      rsvp: rsvpData.rsvp as RSVPStates
    }

    event.addAttendee(attendee)

    await this.repository.save(event)
    return attendee
  }

  async find (id: string): Promise<Event> {
    const event = await this.repository.findById(id)

    if (!event) throw new EventNotFoundError(id)
    return event
  }

  async listAll (page: number = 0, size: number = 10, query?: EventQueryParams): Promise<PaginatedQueryResult<Event>> {
    return this.repository.getAll(page, size, query)
  }

  async updateAgenda (id: string, entries: AgendaSlot[]): Promise<Event> {
    const event = await this.find(id)

    event.agenda = entries

    await this.repository.save(event)

    return event
  }

  async getRsvps (eventId: string, state: string) {
    if (!validateRsvpState(state)) {
      return new Readable()
    }

    const event = await this.find(eventId)

    const attendeeHeaders = 'name,email,document,rsvp,timestamp'

    const headerLine = event.inquiries.reduce((result, question) => {
      return `${result},"${question.title}"`
    }, attendeeHeaders)

    const rsvpsStream = this.repository.getRsvps(eventId, state)

    const transformStream = new Transform({
      writableObjectMode: true,
      transform: ({ inquiryResponses, ...attendee }: Attendee, _encoding, callback) => {
        const responses = inquiryResponses.map(response => response.response)

        const data = [
          attendee.name,
          attendee.email,
          attendee.document,
          attendee.rsvp,
          attendee.timestamp
        ]

        const line = [...data, ...responses].join(',')

        callback(null, line)
      }
    })

    transformStream.write(headerLine)
    rsvpsStream.pipe(transformStream)

    return transformStream
  }

  deleteRSVPbyEmail(email: string) {
    this.repository.deleteRSVPsByEmail(email)
  }

  deleteRSVPbyId(id: string) {
    this.repository.deleteRSVPsById(id)
  }

  async requestToDeclineRSVP (eventId: string, email: string) {
    const attendee = await this.repository.findAtendeeByEmail(eventId,  email)
    if (!attendee) return

    const payload = { action: 'remove-rsvp', eventId }
    const token = this.jwt.signPayload(payload, email, '1d')

    const template = new RemoveNotLoggedRSVPTemplate(token, eventId, email)

    await this.mailClient.send('Remoção de RSVP', email, template)
  }

  async removeNotLoggedRSVP (token:string) {
    const payload = this.jwt.verify(token)
    const { sub: email, eventId } = validateTokenPayload(payload, 'remove-rsvp')

    await this.repository.deleteRSVPInEventByEmail(eventId,  email)
  }

}
