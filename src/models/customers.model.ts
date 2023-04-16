import { Knex } from 'knex'
import { DateTime } from 'luxon'
import { Customer } from '../types'

export default class CustomersManager {
  #knex: Knex

  constructor(knex: Knex) {
    this.#knex = knex
  }

  public async getCustomersByIdentifiers({
    txn,
    identifiers,
  }: {
    txn?: Knex.Transaction
    identifiers: { uuids: string[] } | { ids: string[] }
  }): Promise<Customer[]> {
    let query = this.#knex.withSchema('public').table('customers').select<Customer[]>('*')

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

  public async getAllCustomers({
    txn,
  }: {
    txn?: Knex.Transaction
  }): Promise<Customer[]> {
    let query = this.#knex.withSchema('public').table('customers').select<Customer[]>('*')

    if (txn) {
      query = query.transacting(txn)
    }

    return query
  }

}
