import { DomainError } from '../../domain.error'

export class OrganizerNotFoundError extends DomainError {
  constructor (id: string) {
    super(`Organizer ${id} does not exist`)
  }
}
