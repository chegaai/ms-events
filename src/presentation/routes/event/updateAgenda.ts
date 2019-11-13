import { EventService } from '../../../services/EventService'
import { validate } from '@expresso/validator'
import rescue from 'express-rescue'
import { Response, NextFunction } from 'express'
import { EventNotFoundError } from '../../../domain/event/errors/EventNotFoundError'
import { boom } from '@expresso/errors'
import { IExpressoRequest } from '@expresso/app'
import { AgendaSlot } from '../../../domain/event/structures/Types'

export default function factory (service: EventService) {
  return [
    validate({
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
    }),
    rescue(async (req: IExpressoRequest<AgendaSlot[], { eventId: string }>, res: Response) => {
      const entries = req.body
      const { eventId } = req.params

      const event = await service.updateAgenda(eventId, entries)

      res.status(200)
        .json(event.toObject())
    }),
    (err: Error, _req: IExpressoRequest, _res: Response, next: NextFunction) => {
      if (err instanceof EventNotFoundError) {
        return next(boom.notFound(err.message, { code: 'event-not-found' }))
      }

      next(err)
    }
  ]
}
