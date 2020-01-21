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
        },
        email: { type: 'string' },
        document: { type: 'string'},
        name: { type: 'string'}
      },
      additionalProperties: false,
      required: ['inquiryResponses', 'rsvp']
    }),
    rescue(async (req: IExpressoRequest<Partial<Attendee>, { eventId: string }>, res: Response, next: NextFunction) => {
      const rsvpData = req.body
      const eventId = req.params.eventId
      rsvpData.userId = (req.onBehalfOf) ? req.onBehalfOf.toString() : null

      if (!req.onBehalfOf && (!rsvpData.email || !rsvpData.name || !rsvpData.document)){
        next(boom.badData('email or name or document is missing', { code: 'unprocessable_entity' }))
      }
    
      const attendee = await service.addRSVP(eventId, rsvpData)

      res.status(200)
        .json(attendee)
    }),
    (err: any, _req: IExpressoRequest, _res: Response, next: NextFunction) => {
      if (err instanceof GroupNotFoundError) return next(boom.notFound(err.message, { code: 'group_not_found' }))
      if (err instanceof RSVPOutOfDateError) return next(boom.forbidden(err.message, { code: 'rsvp_closed' }))

      next(err)
    }
  ]
}
