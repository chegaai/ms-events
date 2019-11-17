import rescue from 'express-rescue'
import { Response, NextFunction } from 'express'
import { EventService } from '../../../services/EventService'
import { validate } from '@expresso/validator'
import { IExpressoRequest } from '@expresso/app'

export default function factory (service: EventService) {
  return [
    validate.query({
      type: 'object',
      properties: {
        page: { type: 'number', default: 0 },
        size: { type: 'number', default: 10 },
        mine: { type: 'boolean' }
      },
      additionalProperties: false
    }),
    rescue(async (req: IExpressoRequest<unknown, { groupId: string }, { page: number, mine: boolean, size: number }>, res: Response) => {
      const belongsToUser = req.query.mine ? req.onBehalfOf as string : null
      const searchResult = await service.listUpcoming(req.params.groupId, belongsToUser, req.query.page, req.query.size)
      const { count, range, results, total } = searchResult
      const status = total > count ? 206 : 200

      if (status === 206) {
        res.append('x-content-range', `${range.from}-${range.to}/${total}`)
      }

      res.status(status)
        .json(results.map(result => result.toObject()))
    }),
    (err: any, _req: IExpressoRequest, _res: Response, next: NextFunction) => {
      next(err)
    }
  ]
}
