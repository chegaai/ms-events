import { EvenType, Inquiry, Picture } from '../Event'
import { ObjectId } from 'bson'

export interface CreateEventData {
  eventname: string
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
      address: string,
      zipCode: string,
      number: string,
      complement: string,
      country: string,
      city: string,
      state: string
  },
  rsvp: {
    openAt: Date,
    closeAt: Date
  },
  tags: string[]
  pictures: Picture[]
  groups: ObjectId[]
}
