import rescue from 'express-rescue'
import { boom } from '@expresso/errors'
import { validate } from '@expresso/validator'
import { Request, Response, NextFunction } from 'express'
import { EventService } from '../../../services/EventService'
import { EventAlreadyExistsError } from '../../../domain/event/errors/EventAlreadyExistsError'
import { InvalidEventError } from '../../../domain/event/errors/InvalidEventError';

export function factory (service: EventService) {
  return [
    validate({
      type: 'object',
      properties: {
        eventname: { type: 'string' },
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
        language: {
          type: 'string'
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
        document: { type: 'string' }
      },
      required: ['name', 'email', 'location', 'document', 'tags', 'language'],
      additionalProperties: false
    }),
    rescue(async (req: Request, res: Response) => {
      const eventData = req.body
      const event = await service.create(eventData)

      res.status(201)
        .json(event)
    }),
    (err: any, _req: Request, _res: Response, next: NextFunction) => {
      if (err instanceof EventAlreadyExistsError) return next(boom.conflict(err.message, { code: 'event_already_exists' }))
      if (err instanceof InvalidEventError) return next(boom.badData(err.message, { code: 'invalid_event' }))

      next(err)
    }
  ]
}
