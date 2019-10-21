import { SocialNetworkObject } from '../Event'
import { ObjectId } from 'bson'

export interface CreateEventData {
  name: string,
  founder: string | ObjectId
  pictures: {
    profile: string
    banner: string
  }
  socialNetworks: SocialNetworkObject[]
  tags: string[]
  organizers?: (string | ObjectId)[]
}
