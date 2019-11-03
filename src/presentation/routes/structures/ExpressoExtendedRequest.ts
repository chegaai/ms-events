import { Request } from 'express'

export type ExpressoExtendedRequest = Request & { onBehalfOf: string }
