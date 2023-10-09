import { DateTime } from 'luxon'
import { FilesManager } from '../models'
import { File, FileRequest, FileResponse } from '../types'

export default class FileService {
  #fileManager: FilesManager

  constructor({ fileManager }: { fileManager: FilesManager }) {
    this.#fileManager = fileManager
  }

  public async validateAndGetFiles({
    identifiers,
  }: {
    identifiers: { uuids: string[] } | { ids: string[] }
  }): Promise<Map<string, File>> {
    const returnedFiles = await this.#fileManager.getFilesByIdentifiers({
      identifiers,
    })

    const inputLength = 'uuids' in identifiers ? identifiers.uuids.length : identifiers.ids.length

    if (returnedFiles.length !== inputLength) {
      throw new Error('One or more of the reference files could not be found')
    }
    return new Map(returnedFiles.map((obj) => [obj.uuid, obj]))
  }

  public async validateAndGetFilesByIds({
    identifiers,
  }: {
    identifiers: { uuids: string[] } | { ids: string[] }
  }): Promise<Map<string, File>> {
    const returnedFiles = await this.#fileManager.getFilesByIdentifiers({
      identifiers,
    })

    const inputLength = 'uuids' in identifiers ? identifiers.uuids.length : identifiers.ids.length

    if (returnedFiles.length !== inputLength) {
      throw new Error('One or more of the reference files could not be found')
    }
    return new Map(
      returnedFiles.map((obj) => ['uuids' in identifiers ? obj.uuid : obj.id.toString(), obj])
    )
  }

  public async createFile({ file }: { file: FileRequest }): Promise<File> {
    const createdFile = await this.#fileManager.upsertFile({
      file,
    })

    return createdFile
  }

  public async getFiles({
    entity,
    labels,
    categories,
    range,
  }: {
    entity: string
    labels?: string[]
    categories?: string[]
    range?: { start: DateTime; end: DateTime }
  }): Promise<FileResponse[]> {
    const files = await this.#fileManager.getFiles({
      entityUuid: entity,
      categories,
      labels,
      range,
    })

    return files
  }

  public async updateFileVisibility({
    fileUUID,
    isVisible,
  }: {
    fileUUID: string
    isVisible: boolean
  }): Promise<void> {
    await this.#fileManager.updateFileVisibility({
      fileUUID,
      isVisible,
    })
  }
}
