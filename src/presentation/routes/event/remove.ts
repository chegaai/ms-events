import rescue from 'express-rescue'
import { boom } from '@expresso/errors'
import { Request, Response, NextFunction } from 'express'
import { EventService } from '../../../services/EventService'
import { InvalidEventError } from '../../../domain/event/errors/InvalidEventError'

export function factory (service: EventService) {
  return [
    rescue(async (req: Request, res: Response) => {
      const eventId = req.params.eventId
      await service.delete(eventId)

      res.status(204).end()
    }),
    (err: any, _req: Request, _res: Response, next: NextFunction) => {
      if (err instanceof InvalidEventError) return next(boom.badData(err.message, { code: 'invalid_event_id' }))
      next(err)
    }
  ]
}
