import { injectable } from 'tsyringe'
import { EventService } from './EventService'

@injectable()
export class Services {
  constructor (
    public readonly event: EventService
  ) { }
}
