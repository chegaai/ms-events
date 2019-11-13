import { ObjectId } from 'bson'
import { Nullable } from '../../../utils/Nullable'
import { EventType, Inquiry, Attendee, Picture, AgendaSlot, Place, RSVP } from './Types'

export interface SerializedEvent {
  _id: ObjectId
  name: string
  banner: string
  description: string
  seats: number
  type: EventType
  startAt: Date
  endAt: Date
  owner: ObjectId
  organizers: ObjectId[]
  needsDocument: boolean
  inquiries: Inquiry[]
  place: Place
  rsvp: RSVP
  attendees: Attendee[]
  tags: string[]
  pictures: Picture[]
  groups: ObjectId[]
  agenda: AgendaSlot[]
  createdAt: Date
  updatedAt: Date
  deletedAt: Nullable<Date>,
  publicSince: Date
}
