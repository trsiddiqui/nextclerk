
import { FilesManager } from '../models'
import { File } from '../types'

export default class FileService {

  #fileManager: FilesManager

  constructor({
    fileManager,
  }: {
    fileManager: FilesManager

  }) {
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

    const inputLength =
      'uuids' in identifiers ? identifiers.uuids.length : identifiers.ids.length

    if (returnedFiles.length !== inputLength) {
      throw new Error('One or more of the reference files could not be found')
    }
    return new Map(returnedFiles.map((obj) => [obj.uuid, obj]))
  }

  public async validateAndGetFilesByIds({
    identifiers,
  }: {
    identifiers: { uuids: string[] } | { ids: string[] }
  }): Promise<Map<number, File>> {

    const returnedFiles = await this.#fileManager.getFilesByIdentifiers({
      identifiers,
    })

    const inputLength =
      'uuids' in identifiers ? identifiers.uuids.length : identifiers.ids.length

    if (returnedFiles.length !== inputLength) {
      throw new Error('One or more of the reference files could not be found')
    }
    return new Map(returnedFiles.map((obj) => [obj.id, obj]))
  }

}
