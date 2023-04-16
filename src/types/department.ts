import { EntityDateWithArchive } from '../types'

export interface Department extends EntityDateWithArchive {
  id: number
  internalID: string
  uuid: string
  label: string
}