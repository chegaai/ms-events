
import rescue from 'express-rescue'
import { Request, Response } from 'express'
import { validate } from '@expresso/validator'
import { EventService } from '../../../services/EventService'

export function factory (service: EventService) {
  return [
    validate({
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email'
        },
        eventId: { type: 'string' }
      },
      required: ['email', 'eventId'],
      additionalProperties: false
    }),
    rescue(async (req: Request, res: Response) => {
      const { email, eventId } = req.body.email

      await service.requestRemoveNotLoggedRSVP(eventId, email)

      res.status(202)
        .end()
    })
  ]
}

export default { factory }
