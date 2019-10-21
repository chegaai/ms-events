import rescue from 'express-rescue'
import { boom } from '@expresso/errors'
import { validate } from '@expresso/validator'
import { Request, Response, NextFunction } from 'express'
import { EventService } from '../../../services/EventService'
import { EventNotFoundError } from '../../../domain/event/errors/EventNotFoundError';

export function factory (service: EventService) {
  return [
    validate({
      type: 'object',
      properties: {
        name: {
          type: 'string'
        },
        email: { type: 'string' },
        picture: { type: 'string' },
        socialNetworks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              link: { type: 'string' }
            }
          }
        },
        location: {
          type: 'object',
          properties: {
            country: { type: 'string' },
            state: { type: 'string' },
            city: { type: 'string' }
          }
        },
        tags: {
          type: 'array',
          items: {
            type: 'string'
          }
        },
        document: { type: 'string' },
      },
      required: ['name', 'email', 'location', 'document', 'tags'],
      additionalProperties: false
    }),
    rescue(async (req: Request, res: Response) => {
      const eventData = req.body
      const eventId = req.params.eventId
      const event = await service.update(eventId, eventData)

      res.status(200)
        .json(event)
    }),
    (err: any, _req: Request, _res: Response, next: NextFunction) => {
      if (err instanceof EventNotFoundError) return next(boom.notFound(err.message, { code: 'event_not_found' }))

      next(err)
    }
  ]
}
