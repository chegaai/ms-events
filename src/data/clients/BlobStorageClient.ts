import { IAppConfig } from '../../app.config'
import { inject, injectable } from 'tsyringe'

import { AzureBlobStorageClient } from 'azure-blob-storage-client'


@injectable()
export class BlobStorageClient extends AzureBlobStorageClient{
  constructor (@inject('BlobStorageConfig') { accountAccessKey, accountName, containerName, timeOut }: IAppConfig['azure']['storage']) {
    super(accountAccessKey, accountName, containerName, timeOut)
  }
}
