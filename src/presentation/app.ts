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

  const services = container.resolve(Services)

  app.get('/events/:eventId', routes.find(services.event))
  app.get('/events', routes.listAll(services.event))
  app.post('/events', routes.create(services.event))
  app.put('/events/:eventId', routes.update(services.event))
  app.delete('/events/:eventId', routes.remove(services.event))

  app.use(errors(environment))
})
