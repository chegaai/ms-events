import { routes } from './routes'
import { container } from 'tsyringe'
import expresso from '@expresso/app'
import errors from '@expresso/errors'
import { Services } from '../services'
import { IAppConfig } from '../app.config'
import { createConnection } from '@nindoo/mongodb-data-layer'

export const app = expresso(async (app, config: IAppConfig, environment: string) => {
  const mongodbConnection = await createConnection(config.database.mongodb)
  container.register('MongodbConnection', { useValue: mongodbConnection })
  container.register('UserServiceConnection', { useValue: config.microServices.user })
  container.register('GroupServiceConnection', { useValue: config.microServices.group })

  const services = container.resolve(Services)

  app.get('/:eventId', routes.find(services.event))
  app.get('/', routes.listAll(services.event))
  app.post('/', routes.create(services.event))
  app.put('/:eventId', routes.update(services.event))
  app.delete('/:eventId', routes.remove(services.event))

  app.use(errors(environment))
})
