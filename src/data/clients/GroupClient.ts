import { ObjectId } from 'bson'
import { inject, injectable } from 'tsyringe'
import { IAppConfig } from '../../app.config'
import axios, { AxiosInstance } from 'axios'
import { ServiceError } from '../errors/ServiceError'
import { UnresponsiveServiceError } from '../errors/UnresponsiveServiceError'

@injectable()
export class GroupClient {

  private readonly client: AxiosInstance

  constructor (@inject('GroupServiceConnection') connectionData: IAppConfig['microServices']['group']) {
    this.client = axios.create({ baseURL: connectionData.url })
  }

  async findGroupById (id: ObjectId | string): Promise<any | null> {
    try {
      const { data } = await this.client.get(`/${new ObjectId(id).toHexString()}`)
      return data
    } catch (error) {
      if (!error.response) throw new UnresponsiveServiceError('groups')
      if (error.response.status === 404) return null
      throw new ServiceError(error.response)
    }
  }
}
