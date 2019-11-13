import rescue from 'express-rescue'
import { boom } from '@expresso/errors'
import { Response, NextFunction } from 'express'
import { EventService } from '../../../services/EventService'
import { EventNotFoundError } from '../../../domain/event/errors/EventNotFoundError'
import { IExpressoRequest } from '@expresso/app'

export default function factory (service: EventService) {
  return [
    rescue(async (req: IExpressoRequest<unknown, { eventId: string }>, res: Response) => {
      const eventId = req.params.eventId
      const event = await service.find(eventId)

      res.status(200)
        .json(event.toObject())
    }),
    (err: any, _req: IExpressoRequest, _res: Response, next: NextFunction) => {
      if (err instanceof EventNotFoundError) return next(boom.notFound(err.message, { code: 'event_not_found' }))
      next(err)
    }
  ]
}
