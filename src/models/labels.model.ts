import { Knex } from 'knex'
import { Label, LabelRequestResponse } from '../types'
import { DateTime } from 'luxon'

export default class LabelsManager {
  #knex: Knex

  constructor(knex: Knex) {
    this.#knex = knex
  }

  public async getLabelsByIdentifiers({
    txn,
    identifiers,
  }: {
    txn?: Knex.Transaction
    identifiers: { uuids: string[] } | { ids: string[] }
  }): Promise<Label[]> {
    let query = this.#knex.withSchema('public').table('labels').select<Label[]>('*')

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

  public async getAllLabelsByEntityId({
    entityID,
    txn,
  }: {
    entityID: number
    txn?: Knex.Transaction
  }): Promise<Label[]> {
    let query = this.#knex.withSchema('public')
      .table('labels')
      .select<Label[]>('*')
      .where({ entityID })

    if (txn) {
      query = query.transacting(txn)
    }

    return query
  }

  public async archiveLabelByUuid({
    entityID,
    label,
    userXRefID,
  }: {
    entityID: number
    label: Partial <Label>
    userXRefID: string
  }): Promise<Label> {
    const  archivedLabel = this.#knex.withSchema('public')
      .table('labels')
      .update<Label>({
        ...label,
        archivedAt: DateTime.utc(),
        archivedBy: userXRefID,
      })
      .where({ entityID })
      .andWhere('uuid', label.uuid)


    return archivedLabel
  }

  public async createLabel({
    label,
    userXRefID,
    entityID
  }: {
    label: LabelRequestResponse
    userXRefID: string
    entityID: number
  }): Promise<Label> {
    const [createdLabel] = await this.#knex
      .withSchema('public')
      .table('labels')
      .insert({
        ...label,
        entityID,
        createdAt: DateTime.utc(),
        createdBy: userXRefID,
        updatedAt: DateTime.utc(),
        updatedBy: userXRefID,
      })
      .returning<Label[]>('*')
    return createdLabel
  }

}
