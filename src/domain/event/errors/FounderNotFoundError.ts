import { DomainError } from '../../domain.error'

export class FounderNotFoundError extends DomainError {
  constructor (id: string) {
    super(`Founder ${id} does not exist`)
  }
}
