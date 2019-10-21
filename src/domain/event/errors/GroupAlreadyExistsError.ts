import { DomainError } from '../../domain.error'

export class GroupAlreadyExistsError extends DomainError {
  constructor (document: string) {
    super(`Group with document ${document} already exists`)
  }
}
