import { Knex } from 'knex'
import { DateTime } from 'luxon'
import { SupportingPackage, SupportingPackageUser } from '../types'

export default class SupportingPackagesUsersManager {
  #knex: Knex

  constructor(knex: Knex) {
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

  public async getSupportingPackagesByUUID({
    txn,
    uuid,
  }: {
    txn?: Knex.Transaction
    uuid: string
  }): Promise<SupportingPackage> {
    let query = this.#knex
      .withSchema('public')
      .table('supporting_packages')
      .select<SupportingPackage>('*')
      .where({ uuid })
      .first()

    if (txn) {
      query = query.transacting(txn)
    }

    const supportingPackages = await query
    return supportingPackages
  }

  public async createSupportingPackage({
    supportingPackage,
    userXRefID,
  }: {
    supportingPackage: Partial<SupportingPackage>
    userXRefID: string
  }): Promise<SupportingPackage> {
    const [createdSupportingPackage] = await this.#knex
      .withSchema('public')
      .table('supporting_packages')
      .insert({
        ...supportingPackage,
        createdAt: DateTime.utc(),
        createdBy: userXRefID,
        updatedAt: DateTime.utc(),
        updatedBy: userXRefID,
      })
      .returning<SupportingPackage[]>('*')
    return createdSupportingPackage
  }

  public async updateSupportingPackage({
    entityID,
    identifier,
    supportingPackage,
    userXRefID,
  }: {
    entityID: string
    userXRefID: string
    supportingPackage: Partial<SupportingPackage>
    identifier: { supportingPackageUUID: string } | { supportingPackageID: string }
  }): Promise<SupportingPackage> {
    let query = this.#knex
      .withSchema('public')
      .table('supporting_packages')
      .update<SupportingPackage>({
        ...supportingPackage,
        updatedAt: DateTime.utc(),
        updatedBy: userXRefID,
      })
      .where({ entityID })

    if ('supportingPackageUUID' in identifier) {
      query = query.where('uuid', identifier.supportingPackageUUID)
    }

    if ('supportingPackageID' in identifier) {
      query = query.where('id', identifier.supportingPackageID)
    }

    const [supportingPackageResponse] = await query.returning<SupportingPackage[]>('*')
    return supportingPackageResponse
  }
}
