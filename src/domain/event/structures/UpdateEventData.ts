import { EventType, Inquiry, Picture, Attendee, AgendaSlot, Place, RSVP } from './Types'

export interface UpdateEventData {
  name: string
  description: string
  banner: string
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
  pictures: Picture[]
  groups: string[]
  attendees: Attendee[]
  agenda: AgendaSlot[]
  publicSince: Date
}
