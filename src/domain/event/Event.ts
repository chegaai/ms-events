import { ObjectId } from 'bson'
import { BaseEntity, BaseEntityData } from '../BaseEntity'
import stringToObjectId from 'string-to-objectid'
import { UpdateEventData } from './structures/UpdateEventData'
import { CreateEventData } from './structures/CreateEventData'
import { Inquiry, Place, EventType, RSVP, Attendee, AgendaSlot, Picture, InquiryType } from './structures/Types'

export class Event extends BaseEntity {
  id: ObjectId = new ObjectId()
  name: string = ''
  description: string = ''
  banner: string = ''
  seats: number = 0
  type: EventType = EventType.Presential
  startAt: Date = new Date()
  endAt: Date = new Date()
  owner: ObjectId = new ObjectId()
  organizers: ObjectId[] = []
  needsDocument: boolean = false
  inquiries: Inquiry[] = []
  place: Place = {
    address: '',
    zipCode: '',
    number: '',
    complement: '',
    country: '',
    city: '',
    state: ''
  }
  rsvp: RSVP = {
    openAt: new Date(),
    closeAt: new Date()
  }
  attendees: Attendee[] = []
  agenda: AgendaSlot[] = []
  tags: string[] = []
  pictures: Picture[] = []
  groups: ObjectId[] = []

  static create (id: ObjectId, data: CreateEventData & BaseEntityData): Event {
    const event = new Event()
    event.id = id
    event.name = data.name
    event.description = data.description
    event.banner = data.banner
    event.seats = data.seats
    event.type = data.type
    event.startAt = data.startAt
    event.endAt = data.endAt
    event.owner = stringToObjectId(data.owner)
    event.organizers = data.organizers.map(stringToObjectId)
    event.needsDocument = data.needsDocument
    event.inquiries = data.inquiries.map((inquiry: Inquiry) => ({
      ...inquiry,
      options: inquiry.type !== InquiryType.Selection ? [] : inquiry.options,
    }))
    event.place = data.place
    event.tags = data.tags
    event.groups = data.groups.map(stringToObjectId)
    event.agenda = data.agenda

    if (data.createdAt) event.createdAt = data.createdAt
    if (data.deletedAt) event.deletedAt = data.deletedAt
    if (data.updatedAt) event.updatedAt = data.updatedAt

    return event
  }

  update (dataToUpdate: Partial<UpdateEventData>): Event {
    this.name = dataToUpdate.name || this.name
    this.description = dataToUpdate.description || this.description
    this.seats = dataToUpdate.seats || this.seats
    this.banner = dataToUpdate.banner || this.banner
    this.type = dataToUpdate.type || this.type
    this.startAt = dataToUpdate.startAt || this.startAt
    this.endAt = dataToUpdate.endAt || this.endAt
    this.owner = dataToUpdate.owner ? stringToObjectId(dataToUpdate.owner) : this.owner
    this.organizers = dataToUpdate.organizers ? dataToUpdate.organizers.map(stringToObjectId) : this.organizers
    this.needsDocument = dataToUpdate.needsDocument || this.needsDocument
    this.inquiries = dataToUpdate.inquiries ? dataToUpdate.inquiries.map((inquiry: Inquiry) => ({
      ...inquiry,
      options: inquiry.type !== InquiryType.Selection ? [] : inquiry.options,
    })) : this.inquiries
    this.place = dataToUpdate.place || this.place
    this.rsvp = dataToUpdate.rsvp || this.rsvp
    this.tags = dataToUpdate.tags || this.tags
    this.pictures = dataToUpdate.pictures || this.pictures
    this.groups = dataToUpdate.groups ? dataToUpdate.groups.map(stringToObjectId) : this.groups
    this.agenda = dataToUpdate.agenda || this.agenda
    this.attendees = dataToUpdate.attendees || this.attendees
    this.updatedAt = new Date()
    return this
  }

  addAttendee (attendee: Attendee) {
    if (this.attendees.filter(att => att.email === attendee.email).length > 0) return this
    this.attendees.push(attendee)
    return this
  }

  addPicture (picture: Picture) {
    if (this.pictures.filter(pic => pic.link === picture.link).length > 0) return this
    this.pictures.push(picture)
    return this
  }

  toObject () {
    return {
      _id: this.id,
      name: this.name,
      description: this.description,
      banner: this.banner,
      seats: this.seats,
      type: this.type,
      startAt: this.startAt,
      endAt: this.endAt,
      owner: this.owner,
      organizers: this.organizers,
      needsDocument: this.needsDocument,
      inquiries: this.inquiries,
      place: {
        address: this.place.address,
        zipCode: this.place.zipCode,
        number: this.place.number,
        complement: this.place.complement,
        country: this.place.country,
        city: this.place.city,
        state: this.place.state
      },
      rsvp: {
        openAt: this.rsvp.openAt,
        closeAt: this.rsvp.closeAt
      },
      attendees: this.attendees,
      tags: this.tags,
      pictures: this.pictures,
      groups: this.groups,
      agenda: this.agenda,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt
    }
  }
}
