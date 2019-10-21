import { DomainError } from '../../domain.error'

export class InvalidEventError extends DomainError {
  constructor () {
    super('Invalid event data')
  }
}
