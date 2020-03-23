
import rescue from 'express-rescue'
import { Request, Response } from 'express'
import { validate } from '@expresso/validator'
import { UserService } from '../../../services/UserService'

export function factory (service: UserService) {
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
      const email = req.body.email

      await service.requestRemoveNotLoggedRSVP(email)

      res.status(202)
        .end()
    })
  ]
}

export default { factory }
