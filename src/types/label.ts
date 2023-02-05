import { EntityDateWithArchive } from '../types'

export interface Label extends EntityDateWithArchive {
  id: number
  uuid: string
  label: string
}