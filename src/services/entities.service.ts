
import { EntitiesManager } from '../models'
import { Entity } from '../types'

export default class EntityService {

  #entitiesManager: EntitiesManager

  constructor({
    entitiesManager,
  }: {
    entitiesManager: EntitiesManager

  }) {
    this.#entitiesManager = entitiesManager
  }

  public async validateAndGetEntities({
    identifiers,
  }: {
    identifiers: { uuids: string[] } | { ids: string[] }
  }): Promise<Map<string, Entity>> {

    const returnedLabels = await this.#entitiesManager.getEntitiesByIdentifiers({
      identifiers,
    })

    const inputLength =
      'uuids' in identifiers ? identifiers.uuids.length : identifiers.ids.length

    if (returnedLabels.length !== inputLength) {
      throw new Error('One or more of the reference Entities could not be found')
    }
    return new Map(returnedLabels.map((obj) => [obj.uuid, obj]))
  }

}
