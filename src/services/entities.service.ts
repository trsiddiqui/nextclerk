
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

    const returnedEntities = await this.#entitiesManager.getEntitiesByIdentifiers({
      identifiers,
    })

    const inputLength =
      'uuids' in identifiers ? identifiers.uuids.length : identifiers.ids.length

    if (returnedEntities.length !== inputLength) {
      throw new Error('One or more of the reference Entities could not be found')
    }
    if ('uuids' in identifiers) {
      return new Map(returnedEntities.map((obj) => [obj.uuid, obj]))
    } else  {
      return new Map(returnedEntities.map((obj) => [obj.id.toString(), obj]))
    }
  }

  public async upsertEntity({
    entity,
  }: {
    entity: Partial<Entity>
  }): Promise<Entity> {
    const { uuid, name,folderId, isPrimary } = entity

    const affectedEntity = await this.#entitiesManager.upsertEntity({
      entity: {
        uuid,
        name,
        folderId,
        isPrimary
      },
      userXRefID: 'testUser',
    })

    return affectedEntity
  }


  // TODO: Majid, merge update and upsert
  public async updateEntityByUuid({
    entityUuid,
    entity,
    userXRefID,
  }: {
    entityUuid: string
    entity: Partial<Entity>
    userXRefID: string
  }): Promise<Entity> {

    const existingEntities = await this.validateAndGetEntities({
      identifiers: { uuids: [entityUuid] },
    })


    const existingEntity = existingEntities.get(entityUuid)


    if (
      entity.name != existingEntity.name ||

      entity.address != existingEntity.address ||
      entity.city!= existingEntity.city ||
      entity.state != existingEntity.state ||
      entity.zip != existingEntity.zip ||
      entity.ein != existingEntity.ein
    )
    {
      const {
        name,
        address,
        city,
        state,
        zip,
        ein,
      } = entity

      const updatedEntity = await this.#entitiesManager.upsertEntity({
        userXRefID,
        entity: {
          ...existingEntity,
          name,
          address,
          city,
          state,
          zip,
          ein
        }
      })
    }

    const resultEntities = await this.validateAndGetEntities({
      identifiers: { uuids: [entityUuid] },
    })

    return resultEntities.get(entityUuid)
  }

}
