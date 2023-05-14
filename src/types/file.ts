import { EntityDate } from "./common"

export interface File extends EntityDate{
  id: number
  uuid: string
  name: string
  mimeType: string
  location: string
  remoteReferenceUuid?: string
}
