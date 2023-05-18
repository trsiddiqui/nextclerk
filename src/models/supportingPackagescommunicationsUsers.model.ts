import { Knex } from 'knex'
import { DateTime } from 'luxon'
import { File, SupportingPackageCommunicationUser } from '../types'

export default class SupportingPackagesCommunicationsUsersManager {
  #knex: Knex

  constructor(knex: Knex) {
    this.#knex = knex
  }

  public async upsertCommunicationUsers({
    txn,
    communication,
    userXRefID,
  }: {
    txn?: Knex.Transaction
    communication: Partial<SupportingPackageCommunicationUser>[]
    userXRefID: string
  }): Promise<SupportingPackageCommunicationUser[]> {

    let query = this.#knex
      .withSchema('public')
      .table('communications_users')
      .insert({
        ...communication,
        createdBy: userXRefID,
        updatedBy: userXRefID,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      })
      .onConflict(['uuid'])
      .merge()
      .returning('*')

    if (txn) {
      query = query.transacting(txn)
    }
    const resp = await query
    return resp[0]
  }

  public async getSupportingPackageCommunicationsUsersByCommunicationId({
    txn,
    communicationID
  }: {
    txn?: Knex.Transaction
    communicationID: number
  }): Promise<SupportingPackageCommunicationUser[]> {
    let query = this.#knex
      .withSchema('public')
      .table('communications_attachments')
      .select<SupportingPackageCommunicationUser[]>('*')
      .where({ communicationID })

    if (txn) {
      query = query.transacting(txn)
    }

    const getSupportingPackageCommunicationUsers = await query
    return getSupportingPackageCommunicationUsers
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
