import { app } from './app'
import * as server from '@expresso/server'
import { config, IAppConfig } from '../app.config'

export function start () {
  return server.start<IAppConfig>(app, config)
}
