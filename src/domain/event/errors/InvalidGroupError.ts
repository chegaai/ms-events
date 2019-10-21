import { DomainError } from '../../domain.error'

export class InvalidGroupError extends DomainError {
  constructor () {
    super('Invalid group data')
  }
}
