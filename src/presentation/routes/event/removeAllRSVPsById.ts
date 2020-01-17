import { Response } from 'express'
import rescue from 'express-rescue'
import { IExpressoRequest } from '@expresso/app'
import { EventService } from '../../../services/EventService'

export default function factory (service: EventService) {
  return [
    rescue(async (req: IExpressoRequest<unknown>, res: Response) => {
      service.deleteRSVPbyId(req.onBehalfOf as string)

      res.status(204).end()
    })
  ]
}
