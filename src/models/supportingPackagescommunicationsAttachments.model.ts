import { Knex } from 'knex'
import { DateTime } from 'luxon'
import { File, SupportingPackageCommunicationAttachment, SupportingPackageCommunicationUser } from '../types'

export default class SupportingPackagesCommunicationsAttachmentsManager {
  #knex: Knex

  constructor(knex: Knex) {
    this.#knex = knex
  }

  public async upsertCommunicationAttachments({
    txn,
    communication,
    userXRefID,
  }: {
    txn?: Knex.Transaction
    communication: Partial<SupportingPackageCommunicationAttachment>[]
    userXRefID: string
  }): Promise<SupportingPackageCommunicationAttachment[]> {

    let query = this.#knex
      .withSchema('public')
      .table('communications_attachments')
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

  public async getSupportingPackageCommunicationsAttachmentsByCommunicationId({
    txn,
    communicationID
  }: {
    txn?: Knex.Transaction
    communicationID: number
  }): Promise<SupportingPackageCommunicationAttachment[]> {
    let query = this.#knex
      .withSchema('public')
      .table('communications_attachments')
      .select<SupportingPackageCommunicationAttachment[]>('*')
      .where({ communicationID })

    if (txn) {
      query = query.transacting(txn)
    }

    const getSupportingPackageCommunicationAttachments = await query
    return getSupportingPackageCommunicationAttachments
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
