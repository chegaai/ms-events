import { Inquiry, Place, RSVP, Picture, AgendaSlot, EventType } from './Types'

export interface CreateEventData {
  name: string
  description: string
  seats: number
  type: EventType
  startAt: Date
  endAt: Date
  owner: string
  organizers: string[]
  needsDocument: boolean
  inquiries: Inquiry[]
  place: Place
  rsvp: RSVP
  tags: string[]
  pictures: Omit<Picture, 'isDeleted'>[]
  groups: string[]
  agenda: AgendaSlot[]
}
