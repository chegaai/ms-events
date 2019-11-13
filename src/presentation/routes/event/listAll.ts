import rescue from 'express-rescue'
import { Request, Response, NextFunction } from 'express'
import { EventService } from '../../../services/EventService'
import { validate } from '@expresso/validator'

export default function factory (service: EventService) {
  return [
    validate.query({
      type: 'object',
      properties: {
        page: { type: 'number', default: 0 },
        size: { type: 'number', default: 10 },
        unpublished: { type: 'boolean' }
      }
    }),
    rescue(async (req: Request, res: Response) => {
      const { page, size, unpublished = false } = req.query

      const searchResult = await service.listAll(page, size, !unpublished)

      const { count, range, results, total } = searchResult

      const status = total > count ? 206 : 200

      if (status === 206) {
        res.append('x-content-range', `${range.from}-${range.to}/${total}`)
      }

      res.status(status)
        .json(results.map(result => result.toObject()))
    }),
    (err: any, _req: Request, _res: Response, next: NextFunction) => {
      next(err)
    }
  ]
}
