import { Knex } from 'knex'
import { DateTime } from 'luxon'
import { File, SupportingPackageCommunicationUser } from '../types'
import RelationsManager from './relations.model'

export default class SupportingPackagesCommunicationsUsersManager extends RelationsManager{
  #knex: Knex

  constructor(knex: Knex) {
    super(knex)
    this.#knex = knex
  }

  public async insertCommunicationUsers({
    txn,
    communications,
    userXRefID,
  }: {
    txn?: Knex.Transaction
    communications: Partial<SupportingPackageCommunicationUser>[]
    userXRefID: string
  }): Promise<SupportingPackageCommunicationUser[]> {
    const relations = await this.#knex
      .withSchema('public')
      .table('communications_users')
      .insert(
        communications.map((communication) => ({
          ...communication,
          createdAt: DateTime.utc(),
          createdBy: userXRefID,
          updatedAt: DateTime.utc(),
          updatedBy: userXRefID,
        }))
      )
      .returning<SupportingPackageCommunicationUser[]>('*')

    return relations
  }

  public async upsertSupportingPackageCommunicationAndUserRelationship({
    supportingPackageCommunicationAndUserRelationship,
    userXRefID,
  }: {
    supportingPackageCommunicationAndUserRelationship: Partial<SupportingPackageCommunicationUser>
    userXRefID: string
  }): Promise<SupportingPackageCommunicationUser> {
    const relation = await super.upsertRelations<
    SupportingPackageCommunicationUser,
    SupportingPackageCommunicationUser
    >({
      relationEntity: supportingPackageCommunicationAndUserRelationship,
      tableName: 'communications_users',
      keys: ['communicationID', 'userID'],
      userXRefID,
    })

    return relation
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
      .table('communications_users')
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
