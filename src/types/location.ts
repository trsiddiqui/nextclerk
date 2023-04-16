import { EntityDateWithArchive } from '../types'

export interface Location extends EntityDateWithArchive {
  id: number
  internalID: string
  uuid: string
  label: string
}