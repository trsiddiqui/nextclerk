import { Knex } from 'knex'
import { DateTime } from 'luxon'
import { File } from '../types'

export default class FilesManager {
  #knex: Knex

  constructor(knex: Knex) {
    this.#knex = knex
  }

  public async upsertFile({
    txn,
    file,
  }: {
    txn?: Knex.Transaction
    file: Partial<File>
  }): Promise<File> {
    const fileWithTestUser = {
      ...file,
      createdBy: 'testUser',
      updatedBy: 'testUser',

    }
    let query = this.#knex
      .withSchema('public')
      .table('files')
      .insert(fileWithTestUser)
      .onConflict(['uuid'])
      .merge()
      .returning('*')

    if (txn) {
      query = query.transacting(txn)
    }
    const resp = await query
    return resp[0]
  }

  public async getFilesByID({
    id,
    txn,
  }: {
    id: string
    txn?: Knex.Transaction
  }): Promise<File[] | null> {
    let query = this.#knex
      .withSchema('public')
      .table('files')
      .select('*')
      .where({ id })

    if (txn) {
      query = query.transacting(txn)
    }

    const resp = await query
    return resp
  }

  public async getFilesByIdentifiers({
    txn,
    identifiers,
  }: {
    txn?: Knex.Transaction
    identifiers: { uuids: string[] } | { ids: string[] }
  }): Promise<File[]> {
    let query = this.#knex.withSchema('public').table('files').select<File[]>('*')

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

}
