import { RSVP } from '../structures/Types'

export class RSVPOutOfDateError extends Error {
  constructor (rsvpDates: RSVP) {
    super(`This RSVP is already closed since ${rsvpDates.openAt.toISOString()}`)
  }
}
