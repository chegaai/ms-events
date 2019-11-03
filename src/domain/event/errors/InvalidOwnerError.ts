export class InvalidOwnerError extends Error {
  constructor (ownerId: string) {
    super(`Owner ${ownerId} is not the founder of any given groups`)
  }
}
