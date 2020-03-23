import env from 'sugar-env'
import { IServerConfig } from '@expresso/server'
import { IExpressoConfigOptions } from '@expresso/app'
import { IMongoParams } from '@nindoo/mongodb-data-layer'

interface MicroserviceConfig {
  url: string
}

export interface IAppConfig extends IExpressoConfigOptions {
  name: string,
  database: {
    mongodb: IMongoParams
  },
  server?: IServerConfig['server']
  microServices: {
    user: MicroserviceConfig
    group: MicroserviceConfig
  },
  azure: {
    storage: {
      accountName: string,
      accountAccessKey: string,
      containerName: string,
      timeOut: number
    }
  },
  clients: {
    mail: {
      url: string,
      timeout: number,
      lang: string,
    }
  }
}

const APP_NAME = 'ms-event'

export const config: IAppConfig = {
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
  }
}
