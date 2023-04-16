import { EntityDateWithArchive } from '../types'

export interface Account extends EntityDateWithArchive {
  id: number
  internalID: string
  accountNumber: string
  uuid: string
  label: string
}