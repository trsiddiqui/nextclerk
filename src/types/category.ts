import { EntityDateWithArchive } from '../types'

export interface Category extends EntityDateWithArchive {
  id: number
  uuid: string
  name: string
}