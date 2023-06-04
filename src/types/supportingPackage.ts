import {
  EntityDate,
  SupportingPackageUserResponse,
  EntityDateWithDelete,
  File,
  SupportingPackageUserRequest,
  SupportingPackageCommunicationRequest,
  SupportingPackageCommunicationResponse,
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
  users: SupportingPackageUserRequest[]
  files: supportingPackageFile[]
  communications: SupportingPackageCommunicationRequest[]
}

export interface supportingPackageFile {
  uuid: string
  isMaster?: boolean
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
  users: SupportingPackageUserResponse[]
  files: SupportingPackageAttachmentResponseWithUUID[]
  communications: SupportingPackageCommunicationResponse[]
}

export interface SupportingPackageAttachmentResponse extends EntityDateWithDelete {
  id: number
  supportingPackageID: number
  fileID: number
  name: string
  mimeType?: string
  size: number
  isMaster: boolean
}

export type SupportingPackageAttachmentRequest = Omit<SupportingPackageAttachmentResponse, 'id'> & {
  isMaster: boolean
}
export interface SupportingPackageAttachmentResponseWithUUID {
  uuid: string
  isMaster: boolean
  name: string
  mimeType?: string
}
