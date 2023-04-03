import { Knex } from 'knex'
import { DateTime } from 'luxon'

export default class RelationsManager {
  #knex: Knex

  constructor(knex: Knex) {
    this.#knex = knex
  }

  public async upsertRelations<Relation, DBResponse>({
    relationEntity,
    tableName,
    keys,
    userXRefID,
  }: {
    relationEntity: Partial<Relation>
    tableName: string
    keys: string[]
    userXRefID: string
  }): Promise<DBResponse> {
    const [relation] = await this.#knex
      .withSchema('public')
      .table(tableName)
      .insert({
        ...relationEntity,
        createdAt: DateTime.utc(),
        createdBy: userXRefID,
        updatedAt: DateTime.utc(),
        updatedBy: userXRefID,
      })
      .onConflict(keys)
      .merge({
        ...relationEntity,
        updatedAt: DateTime.utc(),
        updatedBy: userXRefID,
      })
      .returning<DBResponse[]>('*')

    return relation as DBResponse
  }
}
