import { EntityDateWithArchive } from '../types'

export interface Entity extends EntityDateWithArchive {
  id: number
  uuid: string
  name: string
  folderId: string
  isPrimary: boolean
}
