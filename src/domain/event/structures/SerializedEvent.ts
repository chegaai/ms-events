import { ObjectId } from 'bson'
import { EvenType, Inquiry, Attendee, Picture, AgendaSlot } from '../Event'
import { Nullable } from '../../../utils/Nullable'

export interface ISerializedEvent {
  _id: ObjectId
  name: string
  description: string
  seats: number
  type: EvenType
  startAt: Date
  endAt: Date
  owner: ObjectId
  organizers:ObjectId[]
  needsDocument: boolean
  inquiries: Inquiry[]
  place: {
      address: string
      zipCode: string
      number: string
      complement: string
      country: string
      city: string
      state: string
  },
  rsvp: {
    openAt: Date,
    closeAt: Date
  },
  attendees: Attendee[]
  tags: string[]
  pictures: Picture[]
  groups: ObjectId[]
  agenda: AgendaSlot[]
  createdAt: Date
  updatedAt: Date
  deletedAt: Nullable<Date>
}
