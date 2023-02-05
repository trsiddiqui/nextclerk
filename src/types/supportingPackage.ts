import { EntityDate } from '../types'
export interface SupportingPackageRequest {
  id: number
  uuid: string
  number: string
  title: string
  entityUUID: string
  categoryUUID: string
  labelUUID: string
  isConfidential: boolean
  date: Date
  isDraft: boolean
  journalNumber?: string
}

export interface SupportingPackage extends EntityDate {
  id: number
  uuid: string
  number: string
  title: string
  categoryID: number
  labelID: number
  isConfidential: boolean
  date: Date
  isDraft: boolean
  journalNumber: string
}
