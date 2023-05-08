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

  public async getSupportingPackageCommuinications({
    txn,
    id,
  }: {
    txn?: Knex.Transaction
    id: string
  }): Promise<SupportingPackageUser[]> {
    let query = this.#knex
      .withSchema('public')
      .table('supporting_packages_users')
      .select<SupportingPackageUser[]>('*')
      .where('id', id)

    if (txn) {
      query = query.transacting(txn)
    }

    const getSupportingPackageCommuinications = await query
    return getSupportingPackageCommuinications
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
