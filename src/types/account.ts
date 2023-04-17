import { EntityDateWithArchive } from '../types'

export interface Account extends EntityDateWithArchive {
  id: number
  internalID: string
  integrationID: string
  entityID: string
  accountNumber: string
  uuid: string
  label: string
}