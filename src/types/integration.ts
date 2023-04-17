import { EntityDateWithArchive } from '../types'

export interface Integration extends EntityDateWithArchive {
  id: number
  uuid: string
  label: string
}