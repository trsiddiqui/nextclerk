import { Knex } from 'knex'
import { DateTime } from 'luxon'
import { Location } from '../types'

export default class LocationsManager {
  #knex: Knex

  constructor(knex: Knex) {
    this.#knex = knex
  }

  public async getLocationsByIdentifiers({
    txn,
    identifiers,
  }: {
    txn?: Knex.Transaction
    identifiers: { uuids: string[] } | { ids: string[] }
  }): Promise<Location[]> {
    let query = this.#knex.withSchema('public').table('locations').select<Location[]>('*')

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

  public async getAllLocations({
    txn,
  }: {
    txn?: Knex.Transaction
  }): Promise<Location[]> {
    let query = this.#knex.withSchema('public').table('locations').select<Location[]>('*')

    if (txn) {
      query = query.transacting(txn)
    }

    return query
  }

}
