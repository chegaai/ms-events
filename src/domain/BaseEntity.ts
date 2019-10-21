import { Nullable } from '../utils/Nullable'

export interface BaseEntityData {
  deletedAt?: Nullable<Date>
  updatedAt?: Date
  createdAt?: Date
}

export class BaseEntity {
  deletedAt: Nullable<Date> = null
  updatedAt: Date = new Date()
  createdAt: Date = new Date()

  delete () {
    this.deletedAt = new Date()
    this.updatedAt = new Date()
    return this
  }
}
