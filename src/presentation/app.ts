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
  container.register('MailClientConfig', { useValue: config.clients.mail })
  container.register('GroupServiceConnection', { useValue: config.microServices.group })
  container.register('BlobStorageConfig', { useValue: config.azure.storage })
  container.register('JWTConfig', { useValue: config.jwt })

  const services = container.resolve(Services)

  app.get('/', routes.listAll(services.event))
  app.post('/', routes.create(services.event))
  app.get('/:eventId', routes.find(services.event))
  app.put('/:eventId', routes.update(services.event))
  app.delete('/:eventId', routes.remove(services.event))
  app.delete('/email/:email', routes.removeAllRSVPsByEmail(services.event))
  app.get('/:groupId/past', routes.listPast(services.event))
  app.patch('/:eventId/rsvps', routes.addRsvp(services.event))
  app.put('/:eventId/agenda', routes.updateAgenda(services.event))
  app.get('/:groupId/upcoming', routes.listUpcoming(services.event))
  app.get('/:eventId/attendees', routes.getRsvps(services.event))

  // RSVPS
  app.patch('/:eventId/rsvps/declined', routes.moveToDeclined(services.event))
  app.patch('/:eventId/rsvps/confirmed', routes.moveToConfirmed(services.event))
  app.patch('/:eventId/rsvps/waiting', routes.moveToWaitingList(services.event))
  app.post('/:eventId/rsvps/request-decline', routes.requestToDeclineRSVP(services.event))
  
  app.use(errors(environment))
})
