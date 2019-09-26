import rescue from 'express-rescue'
import { Request, Response, NextFunction } from 'express'
import { EventService } from '../../../services/EventService'

export function factory (service: EventService) {
  return [
    rescue(async (_req: Request, res: Response) => {
      const companies = await service.listAll()

      res.status(200)
        .json(companies)
    }),
    (err: any, _req: Request, _res: Response, next: NextFunction) => {
      next(err)
    }
  ]
}
