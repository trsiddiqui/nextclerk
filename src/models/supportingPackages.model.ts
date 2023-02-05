import { Knex } from 'knex'
import { DateTime } from 'luxon'
import { SupportingPackage } from '../types/supportingPackage'

export default class SupportingPackagesManager {
  #knex: Knex

  constructor(knex: Knex) {
    this.#knex = knex
  }

  public async getAllSupportingPackagesByIDs({
    txn,
    ids,
  }: {
    txn?: Knex.Transaction
    ids: string[]
  }): Promise<SupportingPackage[]> {
    let query = this.#knex
      .withSchema('public')
      .table('supporting_packages')
      .select<SupportingPackage[]>('*')
      .whereIn('id', ids)

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

}
