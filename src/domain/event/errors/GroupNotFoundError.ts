import { DomainError } from '../../domain.error'

export class GroupNotFoundError extends DomainError {
  constructor (id: string) {
    super(`Group ${id} does not exist`)
  }
}
