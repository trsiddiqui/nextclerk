import { EntityDate } from "./common"

export interface Communication {
  id: number
  uuid: string
  text: string
  mimeType: string
  location: string
  remoteReferenceUuid?: string
}
