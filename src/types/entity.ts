import { EntityDateWithArchive } from '../types'

export interface Entity extends EntityDateWithArchive {
  id: number
  uuid: string
  name: string
  startOfFinancialYear?: Date
  endOfFinancialYear?: Date
  folderId: string
  isPrimary: boolean
}
