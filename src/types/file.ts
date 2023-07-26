import { EntityDate } from './common'

export interface File extends EntityDate {
  id: number
  uuid: string
  entityID: number
  name: string
  mimeType: string
  location: string
  downloadLink?: string
  remoteReferenceUuid?: string
  size: number
}

export interface FileRequest {
  uuid: string
  entityID: number
  name: string
  mimeType: string
  location: string
  size: number
  remoteReferenceUuid?: string
  downloadLink?: string
}
