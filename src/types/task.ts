import {
  EntityDateWithArchive,
} from '../types'

export interface Task extends EntityDateWithArchive{
  id: number
  uuid: string
  entityID: number
  categoryID: number
  labelID: number
  parentUuid: string
  supportingPackageID?: number
  title: string
  description: string
  isConfidential: boolean
  isRecurring: boolean
  date: Date
  dueDate: Date
  assigneeID: number
  assignerID: number
}

export interface TaskRequestDB {
  uuid: string
  entityID: number
  categoryID: number
  labelID: number
  parentUuid: string
  supportingPackageID?: number
  title: string
  description: string
  isConfidential: boolean
  isRecurring: boolean
  date: Date
  dueDate: Date
  assigneeID: number
  assignerID: number
}

export interface TaskRequest {
  entityUUID: string
  categoryUUID: string
  labelUUID: string
  supportingPackageUUID?: string
  title: string
  description: string
  isConfidential: boolean
  isRecurring: boolean
  date: Date
  dueDate: Date
  assigneeUUID: string
  assignerUUID: string
}

export interface TaskResponse extends EntityDateWithArchive{
  uuid: string
  parentUuid: string
  entityUUID: string
  entityName: string
  categoryUUID: string
  categoryName: string
  labelUUID: string
  label: string
  supportingPackageUUID?: string
  title: string
  description: string
  isConfidential: boolean
  isRecurring: boolean
  date: Date
  dueDate: Date
  status: string | null
  assigneeUUID: string | null
  assigneeName: string | null
  assignerUUID: string
  assignerName: string
}

export type TaskDBResponse = Omit<TaskResponse,
  'assigneeUUID' | 'assigneeName' | 'assignerUUID' | 'assignerName' | 'supportingPackageUUID'> & {
  assigneeID: number,
  assignerID: number,
  supportingPackageID?: number
}

