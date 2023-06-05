import { Knex } from 'knex'
import { DateTime } from 'luxon'
import { SupportingPackage, SupportingPackageAttachmentRequest, SupportingPackageAttachmentResponse, SupportingPackageAttachmentResponseWithUUID } from '../types'
import RelationsManager from './relations.model'

export default class SupportingPackagesAttachmentsManager extends RelationsManager{
  #knex: Knex

  constructor(knex: Knex) {
    super(knex)
    this.#knex = knex
  }

  public async getAllAttachmentsSupportingPackageBySupportingPackageID({
    txn,
    id,
  }: {
    txn?: Knex.Transaction
    id: string
  }): Promise<SupportingPackageAttachmentResponse[]> {
    let query = this.#knex
      .withSchema('public')
      .table('supporting_packages_attachments')
      .select<SupportingPackageAttachmentResponse[]>('*')
      .where('supportingPackageID', id)

    if (txn) {
      query = query.transacting(txn)
    }

    const supportingPackagesUsers = await query
    return supportingPackagesUsers
  }

  public async insertSupportingPackageAttachmentsRelation({
    supportingPackageAttachmentsRelationships,
    userXRefID,
  }: {
    supportingPackageAttachmentsRelationships: Partial<SupportingPackageAttachmentRequest>[]
    userXRefID: string
  }): Promise<SupportingPackageAttachmentResponse[]> {
    const relationships = await this.#knex
      .withSchema('public')
      .table('supporting_packages_attachments')
      .insert(
        supportingPackageAttachmentsRelationships.map((supportingPackageAttachmentsRelationship) => ({
          ...supportingPackageAttachmentsRelationship,
          createdAt: DateTime.utc(),
          createdBy: userXRefID,
          updatedAt: DateTime.utc(),
          updatedBy: userXRefID,
        }))
      )
      .returning<SupportingPackageAttachmentResponse[]>('*')
    return relationships
  }

  public async upsertSupportingPackageAndAttachmentRelationship({
    supportingPackageAndAttachmentRelationship,
    userXRefID,
  }: {
    supportingPackageAndAttachmentRelationship: Partial<SupportingPackageAttachmentRequest>
    userXRefID: string
  }): Promise<SupportingPackageAttachmentResponse> {
    const relation = await super.upsertRelations<
      SupportingPackageAttachmentResponse,
      SupportingPackageAttachmentResponse
    >({
      relationEntity: supportingPackageAndAttachmentRelationship,
      tableName: 'supporting_packages_attachments',
      keys: ['supportingPackageID', 'fileID'],
      userXRefID,
    })

    return relation
  }
}
