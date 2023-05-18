import { Knex } from 'knex'
import { DateTime } from 'luxon'
import { SupportingPackage, SupportingPackageCommunication, SupportingPackageCommunicationRequest, SupportingPackageCommunicationResponse, SupportingPackageUser } from '../types'
import RelationsManager from './relations.model'

export default class SupportingPackagesCommunicationsManager extends RelationsManager {
  #knex: Knex

  constructor(knex: Knex) {
    super(knex)
    this.#knex = knex
  }

  public async getSupportingPackageCommunicationsBySupportingPackageID({
    txn,
    id,
  }: {
    txn?: Knex.Transaction
    id: number
  }): Promise<SupportingPackageCommunication[]> {
    let query = this.#knex
      .withSchema('public')
      .table('supporting_packages_communications')
      .select<SupportingPackageCommunication[]>('*')
      .where('supportingPackageID', id)

    if (txn) {
      query = query.transacting(txn)
    }

    const getSupportingPackageCommunications = await query
    return getSupportingPackageCommunications
  }

  public async insertSupportingPackageUsersRelation({
    supportingPackageUsersRelationships,
    userXRefID,
  }: {
    supportingPackageUsersRelationships: Partial<SupportingPackageUser>[]
    userXRefID: string
  }): Promise<SupportingPackageUser[]> {
    const relationships = await this.#knex
      .withSchema('public')
      .table('supporting_packages_users')
      .insert(
        supportingPackageUsersRelationships.map((supportingPackageUsersRelationship) => ({
          ...supportingPackageUsersRelationship,
          createdAt: DateTime.utc(),
          createdBy: userXRefID,
          updatedAt: DateTime.utc(),
          updatedBy: userXRefID,
        }))
      )
      .returning<SupportingPackageUser[]>('*')
    return relationships
  }

  public async upsertSupportingPackageAndCommunicationRelationship({
    supportingPackageAndCommunicationRelationship,
    userXRefID,

  }: {
    supportingPackageAndCommunicationRelationship: Partial<SupportingPackageCommunicationRequest>
    userXRefID: string
  }): Promise<SupportingPackageCommunication> {
    let query = this.#knex
      .withSchema('public')
      .table('supporting_packages_communications')
      .insert(
        { ...supportingPackageAndCommunicationRelationship,
          createdAt: DateTime.utc(),
          createdBy: userXRefID,
          updatedAt: DateTime.utc(),
          updatedBy: userXRefID,
        })
      .onConflict(['uuid'])
      .merge()
      .returning('*')

    const resp = await query
    return resp[0]
  }
}
