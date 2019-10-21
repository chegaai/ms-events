import rescue from 'express-rescue'
import { boom } from '@expresso/errors'
import { Request, Response, NextFunction } from 'express'
import { EventService } from '../../../services/EventService'
import { InvalidGroupError } from '../../../domain/event/errors/InvalidGroupError'

export function factory (service: EventService) {
  return [
    rescue(async (req: Request, res: Response) => {
      const groupId = req.params.groupId
      await service.delete(groupId)

      res.status(204).end()
    }),
    (err: any, _req: Request, _res: Response, next: NextFunction) => {
      if (err instanceof InvalidGroupError) return next(boom.badData(err.message, { code: 'invalid_group_id' }))
      next(err)
    }
  ]
}
