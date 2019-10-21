import { ObjectId } from 'bson'
import { SocialNetworkObject } from '../Event'
import { Nullable } from '../../../utils/Nullable'

export interface SerializedEvent {
  _id: ObjectId
  name: string
  founder: ObjectId
  organizers: ObjectId[]
  pictures: {
    profile: string
    banner: string
  }
  socialNetworks: SocialNetworkObject[]
  tags: string[]
  events: ObjectId[]
  createdAt: Date
  updatedAt: Date
  deletedAt: Nullable<Date>
}
