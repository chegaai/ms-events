import rescue from 'express-rescue'
import { Request, Response } from 'express'
import { validate } from '@expresso/validator'
import { EventService } from '../../../services/EventService'
import { RSVPStates } from '../../../domain/event/structures/Types'

export function factory (service: EventService) {
  return [
    validate.query({
      type: 'object',
      properties: {
        state: {
          type: 'string',
          enum: Object.values(RSVPStates)
        }
      },
      additionalProperties: false
    }),
    rescue(async (req: Request, res: Response) => {
      const { id: eventId } = req.params
      const { state = RSVPStates.Going } = req.query

      const rsvpStream = service.getRsvps(eventId, state)

      res.status(200)
      res.contentType('text/csv')
      rsvpStream.pipe(res)
    })
  ]
}

export default { factory }
