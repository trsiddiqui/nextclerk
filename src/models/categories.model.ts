import { Knex } from 'knex'
import { DateTime } from 'luxon'
import { Category } from '../types'

export default class CategoriesManager {
  #knex: Knex

  constructor(knex: Knex) {
    this.#knex = knex
  }

  public async getCategoriesByIdentifiers({
    txn,
    identifiers,
  }: {
    txn?: Knex.Transaction
    identifiers: { uuids: string[] } | { ids: string[] }
  }): Promise<Category[]> {
    let query = this.#knex.withSchema('public').table('categories').select<Category[]>('*')

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

  public async getAllCategories({
    txn,
  }: {
    txn?: Knex.Transaction
  }): Promise<Category[]> {
    let query = this.#knex.withSchema('public').table('categories').select<Category[]>('*')

    if (txn) {
      query = query.transacting(txn)
    }

    return query
  }

}
