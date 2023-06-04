import { Knex } from 'knex'
import { Label } from '../types'

export default class LabelsManager {
  #knex: Knex

  constructor(knex: Knex) {
    this.#knex = knex
  }

  public async getLabelsByIdentifiers({
    txn,
    identifiers,
  }: {
    txn?: Knex.Transaction
    identifiers: { uuids: string[] } | { ids: string[] }
  }): Promise<Label[]> {
    let query = this.#knex.withSchema('public').table('labels').select<Label[]>('*')

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

  public async getAllLabelsByEntityId({
    entityID,
    txn,
  }: {
    entityID: number
    txn?: Knex.Transaction
  }): Promise<Label[]> {
    let query = this.#knex.withSchema('public')
      .table('labels')
      .select<Label[]>('*')
      .where({ entityID })

    if (txn) {
      query = query.transacting(txn)
    }

    return query
  }

}
