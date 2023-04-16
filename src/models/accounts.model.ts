import { Knex } from 'knex'
import { DateTime } from 'luxon'
import { Account } from '../types'

export default class AccountsManager {
  #knex: Knex

  constructor(knex: Knex) {
    this.#knex = knex
  }

  public async getAccountssByIdentifiers({
    txn,
    identifiers,
  }: {
    txn?: Knex.Transaction
    identifiers: { uuids: string[] } | { ids: string[] }
  }): Promise<Account[]> {
    let query = this.#knex.withSchema('public').table('accounts').select<Account[]>('*')

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

  public async getAllAccountss({
    txn,
  }: {
    txn?: Knex.Transaction
  }): Promise<Account[]> {
    let query = this.#knex.withSchema('public').table('accounts').select<Account[]>('*')

    if (txn) {
      query = query.transacting(txn)
    }

    return query
  }

}
