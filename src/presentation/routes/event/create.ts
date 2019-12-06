import rescue from 'express-rescue'
import { boom } from '@expresso/errors'
import { validate } from '@expresso/validator'
import { Response, NextFunction } from 'express'
import { EventService } from '../../../services/EventService'
import { OrganizerNotFoundError } from '../../../domain/event/errors/OrganizerNotFoundError'
import { OwnerNotFoundError } from '../../../domain/event/errors/OwnerNotFoundError'
import { InvalidOwnerError } from '../../../domain/event/errors/InvalidOwnerError'
import { GroupNotFoundError } from '../../../domain/event/errors/GroupNotFoundError'
import { IExpressoRequest } from '@expresso/app'
import { CreateEventData } from '../../../domain/event/structures/CreateEventData'

export default function factory (service: EventService) {
  return [
    validate({
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        banner: { type: 'string' },
        seats: { type: 'number', minimum: 1 },
        type: { type: 'string', enum: ['presential', 'online'] },
        startAt: { type: 'string', format: 'date-time' },
        endAt: { type: 'string', format: 'date-time' },
        organizers: {
          type: 'array',
          items: { type: 'string' }
        },
        needsDocument: { type: 'boolean' },
        inquiries: {
          type: 'array',
          items: {
            type: 'object',
            anyOf: [
              {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    enum: ['number', 'text']
                  },
                  title: { type: 'string' },
                  subtitle: { type: 'string' },
                  required: { type: 'boolean' }
                },
                additionalProperties: false,
                required: ['title', 'type', 'required']
              },
              {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    enum: ['selection']
                  },
                  title: { type: 'string' },
                  subtitle: { type: 'string' },
                  options: { type: 'array', items: { type: 'string' } },
                  required: { type: 'boolean' }
                },
                additionalProperties: false,
                required: ['title', 'type', 'required', 'options']
              }
            ]
          }
        },
        place: {
          type: 'object',
          properties: {
            address: { type: 'string' },
            zipCode: { type: 'string' },
            number: { type: 'string' },
            complement: { type: 'string' },
            placeId: { type: 'string' },
            country: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
          },
          additionalProperties: false,
          required: ['address', 'zipCode', 'number', 'country', 'city', 'state', 'placeId']
        },
        tags: {
          type: 'array',
          items: { type: 'string' }
        },
        groups: {
          type: 'array',
          items: { type: 'string' }
        },
        rsvp: {
          type: 'object',
          properties: {
            openAt: { type: 'string', format: 'date-time' },
            closeAt: { type: 'string', format: 'date-time' }
          }
        },
        agenda: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              speaker: { type: 'string' },
              at: { type: 'string', format: 'date-time' },
              index: { type: 'number' }
            },
            additionalProperties: false,
            required: ['title', 'speaker', 'at', 'index']
          }
        }
      },
      required: ['name', 'description', 'seats', 'type', 'startAt', 'endAt', 'needsDocument', 'place', 'groups', 'rsvp'],
      additionalProperties: false
    }),
    rescue(async (req: IExpressoRequest<CreateEventData>, res: Response) => {
      const eventData = req.body
      const event = await service.create('5ddbe2b325f79200107a080e', eventData)

      res.status(201)
        .json(event.toObject())
    }),
    (err: any, _req: IExpressoRequest, _res: Response, next: NextFunction) => {
      if (err instanceof OrganizerNotFoundError) return next(boom.notFound(err.message, { code: 'organizer_not_found' }))
      if (err instanceof InvalidOwnerError) return next(boom.forbidden(err.message, { code: 'invalid_owner' }))
      if (err instanceof OwnerNotFoundError) return next(boom.notFound(err.message, { code: 'owner_not_found' }))
      if (err instanceof GroupNotFoundError) return next(boom.notFound(err.message, { code: 'group_not_found' }))
      next(err)
    }
  ]
}
