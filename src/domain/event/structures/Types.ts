
export enum InquiryType {
  Number = 'number',
  Selection = 'selection',
  Text = 'text'
}

export enum EventType {
  Presential = 'presential',
  Online = 'online'
}

export interface Inquiry {
  type: InquiryType
  title: string
  subtitle: string
  options: string[]
  required: boolean
}

export interface AttendeeResponse {
  questionTitle: string
  response: string
}

export interface Attendee {
  name: string
  email: string
  gender: string
  attendeeResponses: AttendeeResponse[]
}

export interface Picture {
  isDeleted: boolean
  link: string
  index: number
}

export interface AgendaSlot {
  title: string
  speaker: string
  at: Date
  index: number
}

export interface Place {
  address: string
  zipCode: string
  number: string
  complement: string
  country: string
  city: string
  state: string
}

export interface RSVP {
  openAt: Date
  closeAt: Date
}
