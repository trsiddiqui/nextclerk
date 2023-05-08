import { EntityDate } from "./common"

export interface SupportingPackageCommunicationResponse extends EntityDate {
  uuid: string
  supportingPackageUUID: string
  text: string
  cellLink: string
  isCellLinkValid: boolean
  attachmentUUID: string,
  replyToCommunicationUUID: string
  isChangeRequest: boolean
  users: SupportingPackageCommunicationUserResponse[]
}

export interface SupportingPackageCommunicationUserResponse {
  uuid: string,
  name: string,
  family: string
}
