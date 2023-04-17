import { Knex } from 'knex'
import { DateTime } from 'luxon'
import { Integration } from '../types'

export default class IntegrationsManager {
  #knex: Knex

  constructor(knex: Knex) {
    this.#knex = knex
  }

  public async getIntegrationsByIdentifiers({
    txn,
    identifiers,
  }: {
    txn?: Knex.Transaction
    identifiers: { uuids: string[] } | { ids: string[] }
  }): Promise<Integration[]> {
    let query = this.#knex.withSchema('public').table('Integrations').select<Integration[]>('*')

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

  public async getAllIntegrations({
    txn,
  }: {
    txn?: Knex.Transaction
  }): Promise<Integration[]> {
    let query = this.#knex.withSchema('public').table('Integrations').select<Integration[]>('*')

    if (txn) {
      query = query.transacting(txn)
    }

    return query
  }

  public async createIntegration({
    integration,
    userXRefID,
  }: {
    integration: Partial<Integration>
    userXRefID: string
  }): Promise<Integration> {
    const [createdIntegration] = await this.#knex
      .withSchema('public')
      .table('integrations')
      .insert({
        ...integration,
        createdAt: DateTime.utc(),
        createdBy: userXRefID,
        updatedAt: DateTime.utc(),
        updatedBy: userXRefID,
      })
      .returning<Integration[]>('*')
    return createdIntegration
  }

}
