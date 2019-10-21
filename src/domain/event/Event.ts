import { ObjectId } from 'bson'
Number = 'number',
  Selection = 'selection'
}

export interface Inquiry {
  type: InquiryType,
  title: string,
  options: string[], // only if seletion = true
  subtitle: string,
  required: boolean
}

export interface AttendeeResponse {
  questionTitle: string,
  response: string
}

export interface Attendee {
  userId: ObjectId,
  attendeeResponses: AttendeeResponse[]
}

export interface Picture {
  isDeleted: boolean,
  link: string,
  index: number
}

export interface AgendaSlot {
  title: string,
  hour: Date,
  index: number
}

export interface Place {
  address: string,
  zipCode: string,
  number: string,
  complement: string,
  country: string,
  city: string,
  state: string
}

export interface RSVP {
  openAt: Date,
  closeAt: Date
}

export class Event extends BaseEntity {
  id: ObjectId = new ObjectId()
  name: string = ''
  description: string = ''
  seats: number = 0
  type: EvenType = EvenType.Presential
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
    event.seats = data.seats
    event.type = data.type
    event.startAt = data.startAt
    event.endAt = data.endAt
    event.owner = data.owner
    event.organizers = data.organizers.map((organizer: string | ObjectId) => new ObjectId(organizer))

    event.needsDocument = data.needsDocument
    event.inquiries = data.inquiries.map((inquiry: Inquiry) => {
      const data = {
        type: inquiry.type,
        title: inquiry.title,
        options: inquiry.options,
        subtitle: inquiry.subtitle,
        required: inquiry.required
      }

      if (inquiry.type !== InquiryType.Selection) {
        data.options = []
      }
      return data
    })
    event.place = {
      address: data.place.address,
      zipCode: data.place.zipCode,
      number: data.place.number,
      complement: data.place.complement,
      country: data.place.country,
      city: data.place.city,
      state: data.place.state
    }
    event.rsvp = {
      openAt: data.rsvp.openAt,
      closeAt: data.rsvp.openAt
    }
    event.tags = data.tags
    event.pictures = data.pictures.map((picture: Picture) => {
      return {
        isDeleted: false,
        link: picture.link,
        index: picture.index
      }
    })
    event.groups = data.groups.map((group: string | ObjectId) => new ObjectId(group))

    if (data.createdAt) event.createdAt = data.createdAt
    if (data.deletedAt) event.deletedAt = data.deletedAt
    if (data.updatedAt) event.updatedAt = data.updatedAt

    return event
  }

  update (dataToUpdate: UpdateEventData): Event {
    this.name = dataToUpdate.name
    this.description = dataToUpdate.description
    this.seats = dataToUpdate.seats
    this.type = dataToUpdate.type
    this.startAt = dataToUpdate.startAt
    this.endAt = dataToUpdate.endAt
    this.owner = dataToUpdate.owner
    this.organizers = dataToUpdate.organizers.map((organizer: string | ObjectId) => new ObjectId(organizer))
    this.needsDocument = dataToUpdate.needsDocument
    this.inquiries = dataToUpdate.inquiries.map((inquiry: Inquiry) => {
      const data = {
        type: inquiry.type,
        title: inquiry.title,
        options: inquiry.options,
        subtitle: inquiry.subtitle,
        required: inquiry.required
      }

      if (inquiry.type !== InquiryType.Selection) {
        data.options = []
      }
      return data
    })
    this.place = {
      address: dataToUpdate.place.address,
      zipCode: dataToUpdate.place.zipCode,
      number: dataToUpdate.place.number,
      complement: dataToUpdate.place.complement,
      country: dataToUpdate.place.country,
      city: dataToUpdate.place.city,
      state: dataToUpdate.place.state
    }
    this.rsvp = {
      openAt: dataToUpdate.rsvp.openAt,
      closeAt: dataToUpdate.rsvp.openAt
    }
    this.tags = dataToUpdate.tags
    this.pictures = dataToUpdate.pictures.map((picture: Picture) => {
      return {
        isDeleted: false,
        link: picture.link,
        index: picture.index
      }
    })
    this.groups = dataToUpdate.groups.map((group: string | ObjectId) => new ObjectId(group))
    this.agenda = dataToUpdate.agenda.map((agenda: AgendaSlot) => {
      return {
        title: agenda.title,
        hour: agenda.hour,
        index: agenda.index

      }
    })
    this.attendees = dataToUpdate.attendees.map((attendee: Attendee) => {
      return {
        userId: attendee,
        attendeeResponses: attendee.attendeeResponses.map((response: AttendeeResponse) => {
          return {
            questionTitle: response.questionTitle,
            response: response.response
          }
        })
      }
    })
    this.updatedAt = new Date()
    return this
  }

  toObject () {
    return {
      _id: this.id,
      name: this.name,
      description: this.description,
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
