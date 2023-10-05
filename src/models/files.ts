import { Knex } from 'knex'
import { DateTime } from 'luxon'
import { File, FileResponse } from '../types'

export default class FilesManager {
  #knex: Knex

  constructor(knex: Knex) {
    this.#knex = knex
  }

  public async getFiles({
    txn,
    entityUuid,
    categories,
    labels,
    range,
  }: {
    entityUuid: string
    txn?: Knex.Transaction
    categories: string[]
    labels: string[]
    range?: { start: DateTime; end: DateTime }
  }): Promise<FileResponse[]> {
    let query = this.#knex
      .withSchema('public')
      .table('files')
      .select(
        'files.uuid',
        'files.name',
        'files.mimeType',
        'files.size',
        'files.createdAt',
        'files.createdBy',
        'files.isVisible',
        'entities.uuid as entityUUID',
        'entities.name as entityName',
        'categories.uuid as categoryUUID',
        'categories.name as categoryName',
        'labels.uuid as labelUUID',
        'labels.label as labelName'
      )
      .leftJoin('categories', 'files.categoryID', 'categories.id')
      .leftJoin('labels', 'files.labelID', 'labels.id')
      .join('entities', 'files.entityID', 'entities.id')
      .where('entities.uuid', entityUuid)

    if (categories && categories.length > 0) {
      const uncategorized = '00000000-0000-0000-0000-000000000000'
      if (categories.includes(uncategorized)) {
        query = query.andWhereRaw(`
          categories.uuid in ('${categories.join("','")}') or files."categoryID" is null
        `)
      } else {
        query = query.whereIn('categories.uuid', categories)
      }
    }

    if (labels && labels.length > 0) {
      query = query.whereIn('labels.uuid', labels)
    }

    if (range) {
      query = query
        .where('files.createdAt', '>=', range.start.toISO())
        .andWhere('files.createdAt', '<=', range.end.toISO())
    }

    return query
  }

  public async upsertFile({
    txn,
    file,
  }: {
    txn?: Knex.Transaction
    file: Partial<File>
  }): Promise<File> {
    const fileWithTestUser = {
      ...file,
      createdBy: 'testUser',
      updatedBy: 'testUser',
    }
    let query = this.#knex
      .withSchema('public')
      .table('files')
      .insert(fileWithTestUser)
      .onConflict(['uuid'])
      .merge()
      .returning('*')

    if (txn) {
      query = query.transacting(txn)
    }
    const resp = await query
    return resp[0]
  }

  public async getFilesByID({
    id,
    txn,
  }: {
    id: string
    txn?: Knex.Transaction
  }): Promise<File[] | null> {
    let query = this.#knex.withSchema('public').table('files').select('*').where({ id })

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

  public async updateFileVisibility({
    txn,
    fileUUID,
    isVisible,
  }: {
    txn?: Knex.Transaction
    fileUUID: string
    isVisible: boolean
  }): Promise<void> {
    let query = this.#knex
      .withSchema('public')
      .table('files')
      .update({
        isVisible,
      })
      .where({ uuid: fileUUID })

    if (txn) {
      query = query.transacting(txn)
    }

    await query
  }
}
