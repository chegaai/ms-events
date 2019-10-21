import { DomainError } from '../../domain.error'

export class OwnerNotFoundError extends DomainError {
  constructor (id: string) {
    super(`User ${id} does not exist`)
  }
}
