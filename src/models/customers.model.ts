import { Knex } from 'knex'
import { DateTime } from 'luxon'
import { Customer } from '../types'
import RelationsManager from './relations.model'

export default class CustomersManager extends RelationsManager {
  #knex: Knex

  constructor(knex: Knex) {
    super(knex)
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
    entityID,
    txn,
  }: {
    entityID: number
    txn?: Knex.Transaction
  }): Promise<Customer[]> {
    let query = this.#knex.withSchema('public')
      .table('customers')
      .select<Customer[]>('*')
      .where({ entityID })

    if (txn) {
      query = query.transacting(txn)
    }

    return query
  }

  public async upsertCustomers({
    customer,
    userXRefID,
  }: {
    customer: Partial<Customer>
    userXRefID: string
  }): Promise<Customer> {
    const integrationEntity = await super.upsertRelations<
      Customer,
      Customer
    >({
      relationEntity: customer,
      tableName: 'customers',
      keys: ['entityID', 'integrationID', 'uuid'],
      userXRefID,
    })

    return integrationEntity
  }

}
