import { Knex } from 'knex'
import { DateTime } from 'luxon'
import { CustomerAuthDetails } from '../types'

export default class CustomerAuthDetailsManager {
  #knex: Knex

  constructor(knex: Knex) {
    this.#knex = knex
  }

  public async upsertCustomerAuthDetails({
    txn,
    customerAuthDetails,
  }: {
    txn?: Knex.Transaction
    customerAuthDetails: Partial<CustomerAuthDetails>
  }): Promise<CustomerAuthDetails> {
    let query = this.#knex
      .withSchema('public')
      .table('customer_auth_details')
      .insert(customerAuthDetails)
      .onConflict(['applicationID'])
      .merge()
      .returning('*')

    if (txn) {
      query = query.transacting(txn)
    }
    const resp = await query
    return resp[0]
  }

  public async getCustomerAuthDetailsByApplicationID({
    applicationID,
    txn,
  }: {
    applicationID: string
    txn?: Knex.Transaction
  }): Promise<CustomerAuthDetails> {
    let query = this.#knex
      .withSchema('public')
      .table('customer_auth_details')
      .select('*')
      .where({ applicationID })

    if (txn) {
      query = query.transacting(txn)
    }

    const resp = await query
    return resp[0]
  }

  public async getCustomerAuthDetailsByEntityID({
    entityUuid,
    txn,
  }: {
    entityUuid: string
    txn?: Knex.Transaction
  }): Promise<CustomerAuthDetails> {
    let query = this.#knex
      .withSchema('public')
      .table('customer_auth_details')
      .select('*')
      .where({ entityUuid })

    if (txn) {
      query = query.transacting(txn)
    }

    const resp = await query
    return resp[0]
  }
}
