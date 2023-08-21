import { Knex } from 'knex'
import { DateTime } from 'luxon'
import { Department } from '../types'
import RelationsManager from './relations.model'

export default class DepartmentsManager extends RelationsManager {
  #knex: Knex

  constructor(knex: Knex) {
    super(knex)
    this.#knex = knex
  }

  public async getDepartmentsByIdentifiers({
    txn,
    identifiers,
  }: {
    txn?: Knex.Transaction
    identifiers: { uuids: string[] } | { ids: string[] }
  }): Promise<Department[]> {
    let query = this.#knex.withSchema('public').table('departments').select<Department[]>('*')

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

  public async getAllDepartments({
    entityID,
    txn,
  }: {
    entityID: number
    txn?: Knex.Transaction
  }): Promise<Department[]> {
    let query = this.#knex.withSchema('public')
      .table('departments')
      .select<Department[]>('*')
      .where({ entityID })

    if (txn) {
      query = query.transacting(txn)
    }

    return query
  }

  public async upsertDepartments({
    entityID,
    userXRefID,
    department
  }: {
    entityID:  number
    userXRefID: string
    department: Partial<Department>
  }): Promise<Department> {
    const integrationEntity = await super.upsertRelations<
      Department,
      Department
    >({
      relationEntity: department,
      tableName: 'departments',
      keys: ['entityID', 'integrationID', 'uuid'],
      userXRefID,
    })

    return integrationEntity
  }

}
