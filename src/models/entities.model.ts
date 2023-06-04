import { Knex } from 'knex'
import { Entity } from '../types'
import { DateTime } from 'luxon'

export default class EntitiesManager {
  #knex: Knex

  constructor(knex: Knex) {
    this.#knex = knex
  }

  public async getEntitiesByIdentifiers({
    txn,
    identifiers,
  }: {
    txn?: Knex.Transaction
    identifiers: { uuids: string[] } | { ids: string[] }
  }): Promise<Entity[]> {
    let query = this.#knex.withSchema('public').table('entities').select<Entity[]>('*')

    if ('uuids' in identifiers) {
      query = query.whereIn('uuid', identifiers.uuids)
    }

    if ('ids' in identifiers) {
      query = query.whereIn('id', identifiers.ids)
    }

    if (txn) {
      query = query.transacting(txn)
    }

    return query
  }

  public async upsertEntity({
    txn,
    entity,
    userXRefID,
  }: {
    txn?: Knex.Transaction
    entity: Partial<Entity>
    userXRefID: string
  }): Promise<Entity> {
    let query = this.#knex
      .withSchema('public')
      .table('entities')
      .insert({
        ...entity,
        createdBy: userXRefID,
        updatedBy: userXRefID,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      })
      .onConflict(['uuid'])
      .merge()
      .returning('*')

    if (txn) {
      query = query.transacting(txn)
    }
    const resp = await query
    return resp[0]
  }

}
