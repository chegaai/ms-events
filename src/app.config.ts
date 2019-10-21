import env from 'sugar-env'
import { IExpressoConfigOptions } from '@expresso/app'
import { IMongoParams } from '@nindoo/mongodb-data-layer'
import { IServerConfig } from '@expresso/server'

export interface IAppConfig extends IExpressoConfigOptions {
  name: string,
  database: {
    mongodb: IMongoParams
  },
  server?: IServerConfig['server'],
  microServices: {
    user: {
      url: string
    }
  }
}

export const config: IAppConfig = {
  name: 'ms-events',
  server: {
    printOnListening: true,
  },
  database: {
    mongodb: {
      uri: env.get('DATABASE_MONGODB_URI', ''),
      dbName: env.get('DATABASE_MONGODB_DBNAME', 'group'),
      maximumConnectionAttempts: 5,
      options: {}
    }
  },
  microServices: {
    user: {
      url: env.get('MICROSERVICE_USER_URL', '')
    }
  }
}
