import { EntityDate, EntityDateWithArchive, EntityDateWithDelete } from "./common"
export interface SupportingPackageCommunicationUserResponse {
  uuid: string,
  name: string,
  family: string
}

export interface SupportingPackageCommunicationAttachmentResponse {
  uuid: string
  name: string
  mimeType?: string
}

export interface SupportingPackageCommunication extends EntityDateWithArchive {
  id: number
  uuid: string
  supportingPackageID: number
  text: string
  cellLink: string
  isCellLinkValid: boolean
  replyToCommunicationId: number
  isChangeRequest: boolean
}

export type SupportingPackageCommunicationRequest = Omit<SupportingPackageCommunication, 'id' | 'uuid' | 'supportingPackageID'> &
{
  attachments: string[]
  users: string[]
}

export type SupportingPackageCommunicationResponse = Omit<SupportingPackageCommunication, 'id' | 'supportingPackageID'> &
{
  attachments: SupportingPackageCommunicationAttachmentResponse[]
  users: SupportingPackageCommunicationUserResponse[]
}

export interface SupportingPackageCommunicationUser extends EntityDateWithDelete {
  id: number
  communicationID: number
  userID: number
}

export interface SupportingPackageCommunicationAttachment extends EntityDateWithDelete {
  id: number
  communicationID: number
  fileID: number
}



// export interface SupportingPackageCommunicationRequest {
//   uuid: string
//   text: string
//   cellLink: string
//   isCellLinkValid: boolean
//   replyToCommunicationUUID: string
//   isChangeRequest: boolean
//   attachments: string[]
//   users: string[]
// }

// export interface SupportingPackageCommunicationResponse extends EntityDate {
//   uuid: string
//   supportingPackageUUID: string
//   text: string
//   cellLink: string
//   isCellLinkValid: boolean
//   replyToCommunicationUUID: string
//   isChangeRequest: boolean
//   attachments: SupportingPackageCommunicationAttachmentResponse[]
//   users: SupportingPackageCommunicationUserResponse[]
// }
