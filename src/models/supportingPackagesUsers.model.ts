import { Knex } from 'knex'
import { DateTime } from 'luxon'
import { SupportingPackage, SupportingPackageUser } from '../types'
import RelationsManager from './relations.model'

export default class SupportingPackagesUsersManager extends RelationsManager {
  #knex: Knex

  constructor(knex: Knex) {
    super(knex)
    this.#knex = knex
  }

  public async getAllUsersSupportingPackageBySupportingPackageIDs({
    txn,
    ids,
  }: {
    txn?: Knex.Transaction
    ids: string[]
  }): Promise<SupportingPackageUser[]> {
    let query = this.#knex
      .withSchema('public')
      .table('supporting_packages_users')
      .select<SupportingPackageUser[]>('*')
      .whereIn('supportingPackageID', ids)

    if (txn) {
      query = query.transacting(txn)
    }

    const supportingPackagesUsers = await query
    return supportingPackagesUsers
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

  public async upsertSupportingPackageAndUserRelationship({
    supportingPackageAndUserRelationship,
    userXRefID,
  }: {
    supportingPackageAndUserRelationship: Partial<SupportingPackageUser>
    userXRefID: string
  }): Promise<SupportingPackageUser> {
    const relation = await super.upsertRelations<
      SupportingPackageUser,
      SupportingPackageUser
    >({
      relationEntity: supportingPackageAndUserRelationship,
      tableName: 'supporting_packages_users',
      keys: ['supportingPackageID', 'userID', 'type'],
      userXRefID,
    })

    return relation
  }
}
