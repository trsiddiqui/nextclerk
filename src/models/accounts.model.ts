import { Knex } from 'knex'
import { DateTime } from 'luxon'
import { Account } from '../types'
import RelationsManager from './relations.model'

export default class AccountsManager extends RelationsManager {
  #knex: Knex

  constructor(knex: Knex) {
    super(knex)
    this.#knex = knex
  }

  public async getAccountsByIdentifiers({
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
    const accounts = await query

    return  accounts
  }

  public async getAccountsByLabel({
    txn,
    label,
  }: {
    txn?: Knex.Transaction
    label: string
  }): Promise<Account> {
    let query = this.#knex.withSchema('public').table('accounts').select<Account>('*').where({label}).first()

    if (txn) {
      query = query.transacting(txn)
    }
    const account = await query

    return  account
  }

  public async getAllAccounts({
    entityID,
    txn,
  }: {
    entityID: number
    txn?: Knex.Transaction
  }): Promise<Account[]> {
    let query = this.#knex
      .withSchema('public')
      .table('accounts')
      .select<Account[]>('*')
      .where({ entityID })

    if (txn) {
      query = query.transacting(txn)
    }

    const accounts = await query

    return  accounts
  }

  public async upsertAccounts({
    account,
    userXRefID,
  }: {
    account: Partial<Account>
    userXRefID: string
  }): Promise<Account> {
    const integrationEntity = await super.upsertRelations<Account, Account>({
      relationEntity: account,
      tableName: 'accounts',
      keys: ['accountNumber', 'entityID', 'integrationID'],
      userXRefID,
    })

    return integrationEntity
  }
}
