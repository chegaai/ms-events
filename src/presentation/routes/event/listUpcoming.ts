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
        size: { type: 'number', default: 10 }
      }
    }),
    rescue(async (req: Request, res: Response) => {
      const searchResult = await service.listUpcoming(req.params.groupId, req.query.page, req.query.size)
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
