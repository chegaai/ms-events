import { Inquiry, Place, RSVP, AgendaSlot, EventType, Attendee } from './Types'

export interface CreateEventData {
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
  groups: string[]
  agenda: AgendaSlot[]
  attendees?: Attendee[]
  waitingList?: Attendee[]
  publicSince?: Date
}
