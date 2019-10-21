import { DomainError } from '../../domain.error'

export class EventNotFoundError extends DomainError {
  constructor (id: string) {
    super(`Event ${id} does not exist`)
  }
}
