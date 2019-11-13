import rescue from 'express-rescue'
import { boom } from '@expresso/errors'
import { validate } from '@expresso/validator'
import { Response, NextFunction } from 'express'
import { EventService } from '../../../services/EventService'
import { GroupNotFoundError } from '../../../domain/event/errors/GroupNotFoundError'
import { RSVPResponses, Attendee } from '../../../domain/event/structures/Types'
import { RSVPOutOfDateError } from '../../../domain/event/errors/RSVPOutOfDateError'
import { IExpressoRequest } from '@expresso/app'

export default function factory (service: EventService) {
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
    rescue(async (req: IExpressoRequest<Pick<Attendee, 'inquiryResponses' | 'rsvp'>, { eventId: string }>, res: Response) => {
      const rsvpData = req.body
      const eventId = req.params.eventId
      const userId = req.onBehalfOf
      const event = await service.addRSVP(eventId, userId as string, rsvpData)

      res.status(200)
        .json(event.toObject())
    }),
    (err: any, _req: IExpressoRequest, _res: Response, next: NextFunction) => {
      if (err instanceof GroupNotFoundError) return next(boom.notFound(err.message, { code: 'group_not_found' }))
      if (err instanceof RSVPOutOfDateError) return next(boom.forbidden(err.message, { code: 'rsvp_closed' }))

      next(err)
    }
  ]
}
