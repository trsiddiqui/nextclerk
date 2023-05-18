import { EntityDateWithArchive } from '../types'

export interface Entity extends EntityDateWithArchive {
  id: string
  uuid: string
  name: string
  isPrimary: boolean
}
