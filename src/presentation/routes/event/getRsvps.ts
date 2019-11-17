import rescue from 'express-rescue'
import { validate } from '@expresso/validator'
import { Request, Response, NextFunction } from 'express'
import { EventService } from '../../../services/EventService'
import { RSVPStates } from '../../../domain/event/structures/Types'
import { EventNotFoundError } from '../../../domain/event/errors/EventNotFoundError'
import { boom } from '@expresso/errors'

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

      const rsvpStream = await service.getRsvps(eventId, state)

      res.status(200)
      res.contentType('text/csv')
      rsvpStream.pipe(res)
    }),
    (err: Error, _req: Request, _res: Response, next: NextFunction) => {
      if (err instanceof EventNotFoundError) {
        return next(boom.notFound(err.message, { code: 'event-not-found' }))
      }

      next(err)
    }
  ]
}

export default { factory }
