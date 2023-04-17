import { EntityDateWithArchive } from '../types'

export interface Location extends EntityDateWithArchive {
  id: number
  internalID: string
  integrationID: string
  entityID: string
  uuid: string
  label: string
}