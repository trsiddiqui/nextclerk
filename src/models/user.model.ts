import { Knex } from 'knex'
import { DateTime } from 'luxon'
import { DashboardUser, User } from '../types'

export default class UsersManager {
  #knex: Knex

  constructor(knex: Knex) {
    this.#knex = knex
  }

  public async getUsersByIdentifiers({
    txn,
    identifiers,
  }: {
    txn?: Knex.Transaction
    identifiers: { uuids: string[] } | { ids: string[] }
  }): Promise<User[]> {
    let query = this.#knex.withSchema('public').table('users').select<User[]>('*')

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

  public async getUsersByEntityIdsAndKeyword({
    txn,
    entityID,
    search,
  }: {
    txn?: Knex.Transaction
    entityID: number
    search?: string
  }): Promise<User[]> {
    let query = this.#knex
      .withSchema('public')
      .table('users')
      .select<User[]>('*')
      .where('entityID', entityID)

    if (search) {
      query = query.andWhereRaw(
        `CONCAT(LOWER("firstName"), ' ', LOWER("lastName")) like '%${search.toLowerCase()}%'`
      )
    }

    if (txn) {
      query = query.transacting(txn)
    }

    return query
  }

  public async getAllUsersForDashboard({
    customerXRefID,
    txn,
  }: {
    customerXRefID: string
    txn?: Knex.Transaction
  }): Promise<DashboardUser[]> {
    let data
    try {
      const query = this.#knex
        .withSchema('public')
        .table('users AS u')
        .select(
          'u.*',
          'manager.firstName as managerFirstName',
          'manager.lastName as managerLastName',
          'manager.email as managerEmail',
          'manager.uuid as managerUuid',
          'department.uuid as departmentUuid',
          'department.label as departmentLabel'
        )
        .leftJoin('entities', 'entities.id', 'u.entityID')
        .leftJoin('users as manager', 'manager.id', 'u.managerID')
        .leftJoin('departments as department', 'department.id', 'u.departmentID')
        .where('entities.uuid', customerXRefID)
        .andWhereRaw('u."archivedAt" is null')

      data = await query
    } catch (error) {
      console.error(error)
    }

    return data.map((d) => ({
      uuid: d.uuid,
      firstName: d.firstName,
      lastName: d.lastName,
      email: d.email,
      ...(d.managerUuid
        ? {
            manager: {
              firstName: d.managerFirstName,
              lastName: d.managerLastName,
              email: d.managerEmail,
              uuid: d.managerUuid,
            },
          }
        : {}),
      department: {
        label: d.departmentLabel,
        uuid: d.departmentUuid,
      },
      isAccountingManager: d.isAccountingManager,
      archived: d.archivedAt != null,
    }))
  }

  public async updateUser(user: Partial<User>): Promise<void> {
    await this.#knex('users')
      .update({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        entityID: user.entityID,
        managerID: user.managerID,
        departmentID: user.departmentID,
        isAccountingManager: user.isAccountingManager,
      })
      .where({ uuid: user.uuid })
  }

  public async deleteUser(uuid: string): Promise<void> {
    await this.#knex('users')
      .update({
        archivedAt: DateTime.now(),
      })
      .where({ uuid })
  }
}
