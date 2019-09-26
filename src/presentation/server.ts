import { app } from './app'
import { config, IAppConfig } from '../app.config'
import * as server from '@expresso/server'

export function start () {
  return server.start<IAppConfig>(app, config)
}
