export class UserNotFoundError extends Error {
  constructor (userId: string) {
    super(`User "${userId}" was not found`)
  }
}
