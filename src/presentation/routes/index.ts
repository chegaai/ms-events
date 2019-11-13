import find from './event/find'
import create from './event/create'
import update from './event/update'
import remove from './event/remove'
import listAll from './event/listAll'
import addRsvp from './event/addRsvp'
import listPast from './event/listPast'
import listUpcoming from './event/listUpcoming'
import updateAgenda from './event/updateAgenda'
import moveToConfirmed from './rsvp/moveToConfirmed'
import moveToDeclined from './rsvp/moveToDeclined'
import moveToWaitingList from './rsvp/moveToWaitingList'

export const routes = {
  create,
  update,
  remove,
  find,
  listAll,
  addRsvp,
  listPast,
  listUpcoming,
  updateAgenda,
  moveToConfirmed,
  moveToDeclined,
  moveToWaitingList
}
