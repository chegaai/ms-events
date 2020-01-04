import { ObjectId } from 'bson'
import stringToObjectId from 'string-to-objectid'
import { BaseEntity, BaseEntityData } from '../BaseEntity'
import { UpdateEventData } from './structures/UpdateEventData'
import { CreateEventData } from './structures/CreateEventData'
import { RSVPOutOfDateError } from './errors/RSVPOutOfDateError'
import { Inquiry, Place, EventType, RSVP, Attendee, AgendaSlot, Picture, InquiryType, RSVPStates } from './structures/Types'
import { UserNotAllowedError } from './errors/UserNotAllowedError'

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
    state: '',
    placeId: ''
  }
  rsvp: RSVP = {
    openAt: new Date(),
    closeAt: new Date()
  }
  attendees: Attendee[] = []
  waitingList: Attendee[] = []
  agenda: AgendaSlot[] = []
  tags: string[] = []
  pictures: Picture[] = []
  groups: ObjectId[] = []
  publicSince: Date = new Date()

  static create (id: ObjectId, data: CreateEventData & BaseEntityData): Event {
    const event = new Event()
    event.id = id
    event.name = data.name
    event.description = data.description
    event.banner = data.banner
    event.seats = data.seats
    event.place.placeId = data.place.placeId
    event.type = data.type
    event.startAt = data.startAt
    event.endAt = data.endAt
    event.owner = stringToObjectId(data.owner)
    event.organizers = data.organizers.map(stringToObjectId)
    event.needsDocument = data.needsDocument
    if (data.inquiries) event.inquiries = data.inquiries.map((inquiry: Inquiry) => ({
      ...inquiry,
      options: inquiry.type !== InquiryType.Selection ? [] : inquiry.options,
    }))
    event.place = data.place
    event.tags = data.tags
    event.groups = data.groups.map(stringToObjectId)
    event.agenda = data.agenda

    if (data.attendees) event.attendees = data.attendees
    if (data.waitingList) event.waitingList = data.waitingList.sort((prev, next) => prev.timestamp.getTime() - next.timestamp.getTime())

    if (data.createdAt) event.createdAt = data.createdAt
    if (data.deletedAt) event.deletedAt = data.deletedAt
    if (data.updatedAt) event.updatedAt = data.updatedAt

    if (data.publicSince) event.publicSince = data.publicSince

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
    this.publicSince = dataToUpdate.publicSince || this.publicSince
    return this
  }

  moveToList (requesterId: ObjectId, usersToMove: string[], listToMove: RSVPStates) {
    if (this.isOrganizer(requesterId) || this.isOwner(requesterId)) {
      for (let userEmail of usersToMove) {
        const attendee = this.attendees.find(user => user.email === userEmail) || this.waitingList.find(user => user.email === userEmail)
        if (!attendee) continue
        attendee.rsvp = listToMove

        if (listToMove === RSVPStates.WaitingList) {
          this.waitingList.push(attendee)
          this.attendees.filter(user => user.email !== userEmail)
          continue
        }

        this.attendees.push(attendee)
        this.waitingList.filter(user => user.email !== userEmail)
      }
      return this
    }

    throw new UserNotAllowedError(requesterId.toHexString())
  }

  addAttendee (attendee: Attendee) {
    if (!this.isRSVPOpen()) throw new RSVPOutOfDateError(this.rsvp)

    // Attendee is on waiting list and declines event (only possible flux)
    if (this.attendeeIsOnWaitingList(attendee) && attendee.rsvp === RSVPStates.NotGoing) {
      this.waitingList = this.removeFromList(this.waitingList, attendee)
      this.attendees.push(attendee)
      return this
    }

    // Attendee is on attending list
    if (this.attendeeIsOnList(attendee)) {
      // Takes the current state
      const currentState = this.attendees.find(att => att.email === attendee.email)!
      // Remove attendee from list
      this.attendees = this.removeFromList(this.attendees, attendee)
      // Attendee changes the state from Declined to Attending
      if (currentState.rsvp === RSVPStates.NotGoing && attendee.rsvp === RSVPStates.Going) return this.checkAndAddToList(attendee)
      // Attendee changes the state from Attending to Declined
      if (currentState.rsvp === RSVPStates.Going && attendee.rsvp === RSVPStates.NotGoing) return this.moveWaitingList(attendee)

      return this
    }

    // Attendee is not on list and is going
    if (attendee.rsvp === RSVPStates.Going) return this.checkAndAddToList(attendee)

    // Otherwise add to list
    this.attendees.push(attendee)
    return this
  }

  private isOwner (userId: ObjectId) {
    return userId.equals(this.owner)
  }

  private isOrganizer (userId: ObjectId) {
    return !!this.organizers.find((organizer) => organizer.equals(userId))
  }

  /**
   * Removes an attendee from the confirmed list and puts the next attendee from the waiting list onto that list
   * @param declinedAttendee {Attendee} Attendee who was confirmed and then declined
   */
  private moveWaitingList (declinedAttendee: Attendee) {
    this.removeFromList(this.attendees, declinedAttendee)
    const nextAttendeeOnWaitingList = this.waitingList.shift()
    if (nextAttendeeOnWaitingList) this.checkAndAddToList(nextAttendeeOnWaitingList)
  }

  private isRSVPOpen () {
    const today = new Date().getTime()
    return today >= this.rsvp.openAt.getTime() && today <= this.rsvp.closeAt.getTime()
  }

  private addToWaitingList (attendee: Attendee) {
    attendee.rsvp = RSVPStates.WaitingList
    return this.waitingList.push(attendee)
  }

  private checkAndAddToList (attendee: Attendee) {
    if (!this.hasSeats()) { // If no more seats go to waiting list
      this.addToWaitingList(attendee)
      return this
    }
    this.attendees.push(attendee)
    return this
  }

  private removeFromList (list: Attendee[], attendee: Attendee) {
    return list.filter(att => attendee.email !== att.email)
  }

  private hasSeats () {
    return this.seats > this.attendees.filter(att => att.rsvp === RSVPStates.Going).length
  }

  private attendeeIsOnWaitingList (attendee: Attendee) {
    return this.waitingList.find(att => att.email === attendee.email)
  }

  private attendeeIsOnList (attendee: Attendee) {
    return this.attendees.find(att => att.email === attendee.email)
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
        state: this.place.state,
        placeId: this.place.placeId
      },
      rsvp: {
        openAt: this.rsvp.openAt,
        closeAt: this.rsvp.closeAt
      },
      attendees: this.attendees,
      waitingList: this.waitingList,
      tags: this.tags,
      pictures: this.pictures,
      groups: this.groups,
      agenda: this.agenda,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
      publicSince: this.publicSince
    }
  }
}
