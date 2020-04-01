
import rescue from 'express-rescue'
import { Request, Response } from 'express'
import { validate } from '@expresso/validator'
import { EventService } from '../../../services/EventService'

export function factory (service: EventService) {
  return [
    validate({
      type: 'object',
      properties: {
        token: { type: 'string', pattern: '^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$' }
      },
      required: ['token'],
      additionalProperties: false
    }),
    rescue(async (req: Request, res: Response) => {
      const { token } = req.body.email

      await service.removeNotLoggedRSVP(token)

      res.status(202)
        .end()
    })
  ]
}

export default { factory }
