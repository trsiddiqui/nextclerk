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

  public async getUsersByEntityIds({
    txn,
    ids,
  }: {
    txn?: Knex.Transaction
    ids: string[]
  }): Promise<User[]> {
    let query = this.#knex.withSchema('public')
      .table('users')
      .select<User[]>('*')
      .whereIn('id', ids)

    if (txn) {
      query = query.transacting(txn)
    }

    return query
  }

}
