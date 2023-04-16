import { EntityDateWithArchive } from '../types'

export interface Customer extends EntityDateWithArchive {
  id: number
  internalID: string
  uuid: string
  label: string
}