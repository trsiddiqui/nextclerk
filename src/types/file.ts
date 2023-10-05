import { EntityDate } from './common'

export interface File extends EntityDate {
  id: number
  entityID: number
  categoryID?: number
  labelID?: number
  uuid: string
  name: string
  mimeType: string
  location: string
  downloadLink?: string
  remoteReferenceUuid?: string
  size: number
  isVisible: boolean
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
  categoryID?: number
  labelID?: number
}

export interface FileResponse extends Omit<File, 'id' | 'entityID' | 'categoryID' | 'labelID'> {
  entityUUID: string
  entityName: string
  categoryUUID?: string
  categoryName?: string
  labelUUID?: string
  labelName?: string
}
