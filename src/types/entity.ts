import { DateTime } from 'luxon'
import { EntityDateWithArchive } from '../types'

export interface Entity extends EntityDateWithArchive {
  id: number
  uuid: string
  name: string
  startOfFinancialYear?: DateTime
  endOfFinancialYear?: DateTime
  folderId: string
  isPrimary: boolean
}
