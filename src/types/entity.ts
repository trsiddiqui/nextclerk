import { EntityDateWithArchive } from '../types'

export interface Entity extends EntityDateWithArchive {
  id: number
  uuid: string
  name: string
  startOfFinancialYear?: Date
  endOfFinancialYear?: Date
  folderId: string
  isPrimary: boolean
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  ein: string | null
  email: string | null
  contactPerson: string | null
  phone: string | null
}
