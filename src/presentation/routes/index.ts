import find from './event/find'
import create from './event/create'
import update from './event/update'
import remove from './event/remove'
import listAll from './event/listAll'
import addRsvp from './rsvp/addRsvp'
import listPast from './event/listPast'
import getRsvps from './event/getRsvps'
import listUpcoming from './event/listUpcoming'
import updateAgenda from './event/updateAgenda'
import moveToDeclined from './rsvp/moveToDeclined'
import moveToConfirmed from './rsvp/moveToConfirmed'
import moveToWaitingList from './rsvp/moveToWaitingList'
import removeAllRSVPsByEmail from './event/removeAllRSVPsByEmail'
import requestToDeclineRSVP from './rsvp/requestToDeclineRSVP'

export const routes = {
  find,
  create,
  update,
  remove,
  listAll,
  addRsvp,
  listPast,
  getRsvps,
  listUpcoming,
  updateAgenda,
  moveToDeclined,
  moveToConfirmed,
  moveToWaitingList,
  requestToDeclineRSVP,
  removeAllRSVPsByEmail,
}
