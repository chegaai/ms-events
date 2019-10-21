export class UnresponsiveServiceError extends Error {
  constructor (serviceName: string) {
    super(`Service ${serviceName} is unresponsive`)
  }
}
