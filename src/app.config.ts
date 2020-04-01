import env from 'sugar-env'
import { IServerConfig } from '@expresso/server'
import { IExpressoConfigOptions } from '@expresso/app'
import { IMongoParams } from '@nindoo/mongodb-data-layer'

interface BaseConfig extends IExpressoConfigOptions {
  name: string,
  database: {
    mongodb: IMongoParams
  },
  server?: IServerConfig['server']
}

export type IAppConfig = BaseConfig & typeof config

const APP_NAME = 'ms-event'

export const config = {
  name: APP_NAME,
  server: {
    printOnListening: true,
  },
  database: {
    mongodb: {
      uri: env.get('DATABASE_MONGODB_URI', ''),
      dbName: env.get('DATABASE_MONGODB_DBNAME', 'chegaai'),
      maximumConnectionAttempts: 5,
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    }
  },
  microServices: {
    user: {
      url: env.get('MICROSERVICES_USER_URL', '')
    },
    group: {
      url: env.get('MICROSERVICES_GROUP_URL', '')
    }
  },
  azure: {
    storage: {
      accountName: env.get('AZURE_STORAGE_ACCOUNT_NAME', 'chegaai'),
      accountAccessKey: env.get('AZURE_STORAGE_ACCOUNT_ACCESS_KEY', ''),
      containerName: env.get('AZURE_STORAGE_CONTAINER_NAME', 'events'),
      timeOut: env.get('AZURE_STORAGE_TIMEOUT', 60000)
    }
  },
  clients: {
    mail: {
      url: env.get('CLIENTS_MAIL_URL', 'http://zaqar:3000'),
      timeout: env.get.int('CLIENTS_MAIL_TIMEOUT', 9000),
      lang: env.get('ZAQAR_LANG', 'pug'),
    }
  },
  jwt: {
    secret: env.get('JWT_SECRET', ''),
    audience: env.get('JWT_AUDIENCE', 'chega.ai:gateway'),
    expiration: env.get('JWT_EXPIRATION', '1d'),
    issuer: env.get('JWT_ISSUER', 'chega.ai:ms-events')
  },
}
