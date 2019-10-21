import rescue from 'express-rescue'
import { boom } from '@expresso/errors'
import { validate } from '@expresso/validator'
import { Request, Response, NextFunction } from 'express'
import { EventService } from '../../../services/EventService'
import { OrganizerNotFoundError } from '../../../domain/event/errors/OrganizerNotFoundError'
import { OwnerNotFoundError } from '../../../domain/event/errors/OwnerNotFoundError'
import { GroupNotFoundError } from '../../../domain/event/errors/GroupNotFoundError'

export function factory (service: EventService) {
  return [
    validate({
      type: 'object',
      properties: {
      },
      required: ['name', 'founder', 'tags'],
      additionalProperties: false
    }),
    rescue(async (req: Request, res: Response) => {
      const eventData = req.body
      const event = await service.create(eventData)

      res.status(201)
        .json(event)
    }),
    (err: any, _req: Request, _res: Response, next: NextFunction) => {
      if (err instanceof OrganizerNotFoundError) return next(boom.badData(err.message, { code: 'organizer_not_found' }))
      if (err instanceof OwnerNotFoundError) return next(boom.notFound(err.message, { code: 'owner_not_found' }))
      if (err instanceof GroupNotFoundError) return next(boom.notFound(err.message, { code: 'group_not_found' }))
      next(err)
    }
  ]
}
