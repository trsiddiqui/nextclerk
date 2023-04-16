import { Knex } from 'knex'
import { DateTime } from 'luxon'
import { Department } from '../types'

export default class DepartmentsManager {
  #knex: Knex

  constructor(knex: Knex) {
    this.#knex = knex
  }

  public async getDepartmentsByIdentifiers({
    txn,
    identifiers,
  }: {
    txn?: Knex.Transaction
    identifiers: { uuids: string[] } | { ids: string[] }
  }): Promise<Department[]> {
    let query = this.#knex.withSchema('public').table('departments').select<Department[]>('*')

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

  public async getAllDepartments({
    txn,
  }: {
    txn?: Knex.Transaction
  }): Promise<Department[]> {
    let query = this.#knex.withSchema('public').table('departments').select<Department[]>('*')

    if (txn) {
      query = query.transacting(txn)
    }

    return query
  }

}
