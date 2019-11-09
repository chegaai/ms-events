import rescue from 'express-rescue'
import { boom } from '@expresso/errors'
import { validate } from '@expresso/validator'
import { Request, Response, NextFunction } from 'express'
import { EventService } from '../../../services/EventService'
import { GroupNotFoundError } from '../../../domain/event/errors/GroupNotFoundError'
import { RSVPResponses } from '../../../domain/event/structures/Types'
import { ExpressoExtendedRequest } from '../structures/ExpressoExtendedRequest'
import { RSVPOutOfDateError } from '../../../domain/event/errors/RSVPOutOfDateError'

export function factory (service: EventService) {
  return [
    validate({
      type: 'object',
      properties: {
        inquiryResponses: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              questionTitle: { type: 'string' },
              response: { type: 'string' }
            },
            additionalProperties: false,
            required: ['questionTitle', 'response']
          }
        },
        rsvp: {
          type: 'string',
          enum: Object.values(RSVPResponses)
        }
      },
      additionalProperties: false,
      required: ['inquiryResponses', 'rsvp']
    }),
    rescue(async (req: ExpressoExtendedRequest, res: Response) => {
      const rsvpData = req.body
      const eventId = req.params.eventId
      const userId = req.onBehalfOf
      const event = await service.addRSVP(eventId, userId, rsvpData)

      res.status(200)
        .json(event)
    }),
    (err: any, _req: Request, _res: Response, next: NextFunction) => {
      if (err instanceof GroupNotFoundError) return next(boom.notFound(err.message, { code: 'group_not_found' }))
      if (err instanceof RSVPOutOfDateError) return next(boom.forbidden(err.message, { code: 'rsvp_closed' }))

      next(err)
    }
  ]
}
