import { Knex } from 'knex'
import { DateTime } from 'luxon'
import { Location } from '../types'
import RelationsManager from './relations.model'

export default class LocationsManager extends RelationsManager {
  #knex: Knex

  constructor(knex: Knex) {
    super(knex)
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
    entityID,
    txn,
  }: {
    entityID: number
    txn?: Knex.Transaction
  }): Promise<Location[]> {
    let query = this.#knex.withSchema('public')
      .table('locations')
      .select<Location[]>('*')
      .where({ entityID })

    if (txn) {
      query = query.transacting(txn)
    }

    return query
  }

  public async upsertLocations({
    location,
    userXRefID,
  }: {
    location: Partial<Location>
    userXRefID: string
  }): Promise<Location> {
    const integrationEntity = await super.upsertRelations<
      Location,
      Location
    >({
      relationEntity: location,
      tableName: 'locations',
      keys: ['entityID', 'integrationID', 'uuid'],
      userXRefID,
    })

    return integrationEntity
  }

}
