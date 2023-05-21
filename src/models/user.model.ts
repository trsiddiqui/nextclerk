import { Knex } from 'knex'
import { DateTime } from 'luxon'
import { User } from '../types'

export default class UsersManager {
  #knex: Knex

  constructor(knex: Knex) {
    this.#knex = knex
  }

  public async getUsersByIdentifiers({
    txn,
    identifiers,
  }: {
    txn?: Knex.Transaction
    identifiers: { uuids: string[] } | { ids: string[] }
  }): Promise<User[]> {
    let query = this.#knex.withSchema('public').table('users').select<User[]>('*')

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

  public async getUsersByEntityIdsAndKeyword({
    txn,
    entityID,
    search,
  }: {
    txn?: Knex.Transaction
    entityID: number
    search?: string
  }): Promise<User[]> {
    let query = this.#knex
      .withSchema('public')
      .table('users')
      .select<User[]>('*')
      .where('entityID', entityID)

    if (search) {
      query = query.andWhereRaw(
        `CONCAT(LOWER("firstName"), ' ', LOWER("lastName")) like '%${search.toLowerCase()}%'`
      )
    }

    if (txn) {
      query = query.transacting(txn)
    }

    return query
  }
}
