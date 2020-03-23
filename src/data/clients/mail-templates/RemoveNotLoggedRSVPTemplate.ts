import { Template } from './Template'

export class RemoveNotLoggedRSVPTemplate extends Template {
  constructor (
    public readonly token: string,
    public readonly eventId: string,
    public readonly email: string
  ) {
    super('remove-not-logged-rsvp')
  }

  getData () {
    return {
      link: `https://chega.ai/remove-not-logged-rsvp?token=${encodeURIComponent(this.token)}&eventId=${encodeURIComponent(this.eventId)}&email=${encodeURIComponent(this.email)}`
    }
  }
}
