import { DomainError } from '../../domain.error'

export class UserNotFoundError extends DomainError {
  constructor (id: string) {
    super(`User ${id} does not exist`)
  }
}
