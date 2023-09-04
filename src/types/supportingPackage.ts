import {
  EntityDate,
  SupportingPackageUserResponse,
  EntityDateWithDelete,
  File,
  SupportingPackageUserRequest,
  SupportingPackageCommunicationRequest,
  SupportingPackageCommunicationResponse,
  JournalEntryRequest,
  JournalEntryResponse,
} from '../types'

export interface SupportingPackageRequest {
  number: string
  title: string
  categoryUUID: string
  labelUUID: string
  isConfidential: boolean
  date: Date
  isDraft: boolean
  journalNumber?: string
  taskID?: string
  users: SupportingPackageUserRequest[]
  files: supportingPackageFile[]
  communications: SupportingPackageCommunicationRequest[]
  journalEntries?: JournalEntryRequest[]
}

export interface supportingPackageFile {
  uuid: string
  isMaster?: boolean
  highLights?: object
}

export type JournalStatusType =  'SYNCED' | 'NOT-SYNCED' | 'ERROR'

export interface SupportingPackagePatchRequest {
  journalID?: string
  journalStatus: JournalStatusType
}

export interface SupportingPackage extends EntityDate {
  id: number
  uuid: string
  number: string
  title: string
  categoryID: number
  entityID: number
  labelID: number
  isConfidential: boolean
  date: Date
  isDraft: boolean
  journalNumber: string
  taskID?: string
  journalID?: string
  journalStatus?: string
}

export interface SupportingPackageResponse extends EntityDate {
  uuid: string
  number: string
  title: string
  entityUUID: string
  entityName: string
  categoryUUID: string
  categoryName: string
  labelUUID: string
  label: string
  isConfidential: boolean
  date: Date
  isDraft: boolean
  journalNumber: string
  taskID?: string
  journalID?: string
  journalStatus?: string
  users: SupportingPackageUserResponse[]
  files: SupportingPackageAttachmentResponseWithUUID[]
  communications: SupportingPackageCommunicationResponse[]
  journalEntries: JournalEntryResponse[]
}

export interface SupportingPackageAttachmentResponse extends EntityDateWithDelete {
  id: number
  supportingPackageID: number
  uuid: string
  fileID: number
  name: string
  mimeType?: string
  highLights?: object
  size: number
  isMaster: boolean
}

export type SupportingPackageAttachmentRequest = Omit<SupportingPackageAttachmentResponse, 'id'>
export interface SupportingPackageAttachmentResponseWithUUID {
  uuid: string
  isMaster: boolean
  highLights?: object
  name: string
  mimeType?: string
  size: number
  downloadUrl?: string
}
