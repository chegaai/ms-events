import { DomainError } from '../../domain.error'

export class EventAlreadyExistsError extends DomainError {
  constructor (document: string) {
    super(`Event with document ${document} already exists`)
  }
}
