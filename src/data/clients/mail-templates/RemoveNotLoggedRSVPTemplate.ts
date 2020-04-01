import { Template } from './Template'

export class RemoveNotLoggedRSVPTemplate extends Template {
  constructor (
    public readonly token: string,
    public readonly eventId: string,
    public readonly email: string
  ) {
    super('remove-rsvp')
  }

  getData () {
    return {
      link: `https://chega.ai/remove-rsvp?token=${encodeURIComponent(this.token)}&eventId=${encodeURIComponent(this.eventId)}&email=${encodeURIComponent(this.email)}`
    }
  }
}
