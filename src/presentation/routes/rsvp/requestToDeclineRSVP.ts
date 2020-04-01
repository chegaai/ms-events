
import rescue from 'express-rescue'
import { Request, Response } from 'express'
import { validate } from '@expresso/validator'
import { EventService } from '../../../services/EventService'

export default function factory (service: EventService) {
  return [
    validate({
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email'
        }
      },
      required: ['email'],
      additionalProperties: false
    }),
    rescue(async (req: Request, res: Response) => {
      const { email } = req.body
      const { eventId } = req.params

      await service.requestToDeclineRSVP(eventId, email)
      res.status(202)
        .end()
    })
  ]
}
