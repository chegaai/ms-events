import { Response } from 'express'
import rescue from 'express-rescue'
import { IExpressoRequest } from '@expresso/app'
import { EventService } from '../../../services/EventService'

export default function factory (service: EventService) {
  return [
    rescue(async (req: IExpressoRequest<unknown, { email: string }>, res: Response) => {
      const email = req.params.email
      service.deleteRSVPbyEmail(email)

      res.status(204).end()
    })
  ]
}
