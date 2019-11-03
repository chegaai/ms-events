import { factory as create } from './event/create'
import { factory as update } from './event/update'
import { factory as remove } from './event/remove'
import { factory as listAll } from './event/listAll'
import { factory as find } from './event/find'
import { factory as addRsvp } from './event/addRsvp'


export const routes = {
  create,
  update,
  remove,
  find,
  listAll,
  addRsvp
}
