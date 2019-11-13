export class UserNotAllowedError extends Error {
  constructor (userId: string) {
    super(`User "${userId} is not allowed to perform this operation`)
  }
}
