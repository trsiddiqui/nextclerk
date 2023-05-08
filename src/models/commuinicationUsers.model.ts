import { SupportingPackageCommunicationUserResponse } from '@/types/supportingPackageCommunication'
import { Knex } from 'knex'
import { DateTime } from 'luxon'
import { SupportingPackage, SupportingPackageUser } from '../types'
import RelationsManager from './relations.model'

export default class SupportingPackagesCommunicationsManager extends RelationsManager {
  #knex: Knex

  constructor(knex: Knex) {
    super(knex)
    this.#knex = knex
  }

  public async getCommuinicationsBySupportingPackageID({
    txn,
    supportingPackageID,
  }: {
    txn?: Knex.Transaction
    supportingPackageID: string
  }): Promise<SupportingPackageCommunicationUserResponse[]> {
    let query = this.#knex
      .withSchema('public')
      .table('communications_users')
      .select<SupportingPackageCommunicationUserResponse[]>('*')
      .where('id', supportingPackageID)

    if (txn) {
      query = query.transacting(txn)
    }

    const CommuinicationsBySupportingPackageID = await query
    return CommuinicationsBySupportingPackageID
  }

  // public async insertSupportingPackageUsersRelation({
  //   supportingPackageUsersRelationships,
  //   userXRefID,
  // }: {
  //   supportingPackageUsersRelationships: Partial<SupportingPackageUser>[]
  //   userXRefID: string
  // }): Promise<SupportingPackageUser[]> {
  //   const relationships = await this.#knex
  //     .withSchema('public')
  //     .table('supporting_packages_users')
  //     .insert(
  //       supportingPackageUsersRelationships.map((supportingPackageUsersRelationship) => ({
  //         ...supportingPackageUsersRelationship,
  //         createdAt: DateTime.utc(),
  //         createdBy: userXRefID,
  //         updatedAt: DateTime.utc(),
  //         updatedBy: userXRefID,
  //       }))
  //     )
  //     .returning<SupportingPackageUser[]>('*')
  //   return relationships
  // }

  // public async upsertSupportingPackageAndUserRelationship({
  //   supportingPackageAndUserRelationship,
  //   userXRefID,
  // }: {
  //   supportingPackageAndUserRelationship: Partial<SupportingPackageUser>
  //   userXRefID: string
  // }): Promise<SupportingPackageUser> {
  //   const relation = await super.upsertRelations<
  //     SupportingPackageUser,
  //     SupportingPackageUser
  //   >({
  //     relationEntity: supportingPackageAndUserRelationship,
  //     tableName: 'supporting_packages_users',
  //     keys: ['supportingPackageID', 'userID', 'type'],
  //     userXRefID,
  //   })

  //   return relation
  // }
}
