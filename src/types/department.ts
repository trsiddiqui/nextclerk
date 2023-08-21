import { EntityDateWithArchive } from '../types'

export interface Department extends EntityDateWithArchive {
  id: number
  internalID: string
  integrationID: string
  entityID: string
  uuid: string
  label: string
}

export interface DepartmentRequest  {
  internalID: number
  integrationID: number
  entityID: string
  accountNumber: string
  uuid: string
  label: string
  createdBy: string
  updatedBy: string
}
