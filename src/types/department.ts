import { EntityDateWithArchive } from '../types'

export interface Department extends EntityDateWithArchive {
  id: number
  internalID: string
  integrationID: string
  entityID: string
  uuid: string
  label: string
}