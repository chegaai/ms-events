import rescue from 'express-rescue'
import { boom } from '@expresso/errors'
import { validate } from '@expresso/validator'
import { IExpressoRequest } from '@expresso/app'
import { Response, NextFunction } from 'express'
import { EventService } from '../../../services/EventService'
import { RSVPStates } from '../../../domain/event/structures/Types'
import { GroupNotFoundError } from '../../../domain/event/errors/GroupNotFoundError'
import { RSVPOutOfDateError } from '../../../domain/event/errors/RSVPOutOfDateError'
import { UserNotFoundError } from '../../../domain/event/errors/UserNotFoundError'
import { UserNotAllowedError } from '../../../domain/event/errors/UserNotAllowedError'

export default function factory (service: EventService) {
  return [
    validate({
      type: 'object',
      properties: {
        userEmails: {
          type: 'array',
          items: { type: 'string' }
        }
      },
      additionalProperties: false,
      required: ['userEmails']
    }),
    rescue(async (req: IExpressoRequest<{ userEmails: string[] }, { eventId: string }>, res: Response) => {
      const userEmails = req.body.userEmails
      const eventId = req.params.eventId
      const requestUserId = req.onBehalfOf
      const event = await service.moveToList(requestUserId as string, eventId, userEmails, RSVPStates.Going)

      res.status(200)
        .json(event.toObject())
    }),
    (err: any, _req: IExpressoRequest, _res: Response, next: NextFunction) => {
      if (err instanceof UserNotFoundError) return next(boom.notFound(err.message, { code: 'user_not_found' }))
      if (err instanceof UserNotAllowedError) return next(boom.forbidden(err.message, { code: 'user_not_admin' }))
      if (err instanceof GroupNotFoundError) return next(boom.notFound(err.message, { code: 'group_not_found' }))
      if (err instanceof RSVPOutOfDateError) return next(boom.forbidden(err.message, { code: 'rsvp_closed' }))

      next(err)
    }
  ]
}
