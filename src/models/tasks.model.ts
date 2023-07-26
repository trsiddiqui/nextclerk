import { Knex } from 'knex'
import { DateTime } from 'luxon'
import { SupportingPackage, SupportingPackageRequest } from '../types/supportingPackage'
import { Task, TaskDBResponse, TaskRequest, TaskRequestDB } from '@/types'

export default class TasksManager {
  #knex: Knex

  constructor(knex: Knex) {
    this.#knex = knex
  }


  public async getTaskByUUID({
    txn,
    uuid,
  }: {
    txn?: Knex.Transaction
    uuid: string
  }): Promise<TaskDBResponse> {
    let query = this.#knex
    .withSchema('public')
    .table('tasks')
    .join('labels', 'labels.id', 'tasks.labelID')
    .join('entities', 'entities.id', 'tasks.entityID')
    .join('categories', 'categories.id', 'tasks.categoryID')
    .leftJoin('supporting_packages', 'supporting_packages.id', 'tasks.supportingPackageID')
    .select<TaskDBResponse>(
      'tasks.*',
      'labels.label as label',
      'labels.uuid as labelUUID',
      'categories.name as categoryName',
      'categories.uuid as categoryUUID',
      'entities.name as entityName',
      'entities.uuid as entityUUID',
      'supporting_packages.status as status',
    )
    .where('tasks.uuid', uuid)

    if (txn) {
      query = query.transacting(txn)
    }

    const task = await query
    return task
  }

  public async getTasksByParentUUID({
    txn,
    uuid,
  }: {
    txn?: Knex.Transaction
    uuid: string
  }): Promise<TaskDBResponse[]> {
    let query = this.#knex
    .withSchema('public')
    .table('tasks')
    .join('labels', 'labels.id', 'tasks.labelID')
    .join('entities', 'entities.id', 'tasks.entityID')
    .join('categories', 'categories.id', 'tasks.categoryID')
    .leftJoin('supporting_packages', 'supporting_packages.id', 'tasks.supportingPackageID')
    .select<TaskDBResponse[]>(
      'tasks.*',
      'labels.label as label',
      'labels.uuid as labelUUID',
      'categories.name as categoryName',
      'categories.uuid as categoryUUID',
      'entities.name as entityName',
      'entities.uuid as entityUUID',
      'supporting_packages.status as status',
    )
    .where('tasks.parentUuid', uuid)

    if (txn) {
      query = query.transacting(txn)
    }

    const task = await query
    return task
  }

  public async createTask({
    task,
    userXRefID,
  }: {
    task: TaskRequestDB
    userXRefID: string
  }): Promise<Task> {
    const [createdTask] = await this.#knex
      .withSchema('public')
      .table('tasks')
      .insert({
        ...task,
        createdAt: DateTime.utc(),
        createdBy: userXRefID,
        updatedAt: DateTime.utc(),
        updatedBy: userXRefID,
      })
      .returning<Task[]>('*')
    return createdTask
  }

  public async updateTask({
    entityID,
    identifier,
    task,
    userXRefID,
  }: {
    entityID: number
    userXRefID: string
    task: Partial<Task>
    identifier: { taskUUID: string } | { TaskID: string }
  }): Promise<Task> {
    let query = this.#knex
      .withSchema('public')
      .table('tasks')
      .update<Task>({
        ...task,
        updatedAt: DateTime.utc(),
        updatedBy: userXRefID,
      })
      .where({ entityID })

    if ('taskUUID' in identifier) {
      query = query.where('uuid', identifier.taskUUID)
    }

    if ('TaskID' in identifier) {
      query = query.where('id', identifier.TaskID)
    }

    const [taskResponse] = await query.returning<Task[]>('*')
    return taskResponse
  }

  public async archiveTask({
    entityID,
    identifier,
    task,
    userXRefID,
  }: {
    entityID: string
    userXRefID: string
    task: Partial<Task>
    identifier: { taskUUID: string } | { TaskID: string }
  }): Promise<Task> {
    let query = this.#knex
      .withSchema('public')
      .table('tasks')
      .update<Task>({
        ...task,
        archivedAt: DateTime.utc(),
        archivedBy: userXRefID,
      })
      .where({ entityID })

    if ('taskUUID' in identifier) {
      query = query.where('uuid', identifier.taskUUID)
    }

    if ('TaskID' in identifier) {
      query = query.where('id', identifier.TaskID)
    }

    const [taskResponse] = await query.returning<Task[]>('*')
    return taskResponse
  }

  public async getTasksByIdentifiers({
    txn,
    identifiers,
  }: {
    txn?: Knex.Transaction
    identifiers: { uuids: string[] } | { ids: string[] }
  }): Promise<Task[]> {
    let query = this.#knex.withSchema('public').table('tasks').select<Task[]>('*')

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

  // public async getTasksByEntityId({
  //   entityID,
  //   txn,
  // }: {
  //   entityID: number
  //   txn?: Knex.Transaction

  // }): Promise<Task[]> {
  //   let query = this.#knex
  //     .withSchema('public')
  //     .table('tasks')
  //     .where({ entityID })
  //     .select<Task[]>('*')

  //   if (txn) {
  //     query = query.transacting(txn)
  //   }

  //   return query
  // }

  public async getTasksByEntityId({
    txn,
    entityID,
  }: {
    txn?: Knex.Transaction
    entityID: number
  }): Promise<TaskDBResponse[]> {
    let query = this.#knex
      .withSchema('public')
      .table('tasks')
      .join('labels', 'labels.id', 'tasks.labelID')
      .join('entities', 'entities.id', 'tasks.entityID')
      .join('categories', 'categories.id', 'tasks.categoryID')
      .leftJoin('supporting_packages', 'supporting_packages.id', 'tasks.supportingPackageID')
      .select<TaskDBResponse[]>(
        'tasks.*',
        'labels.label as label',
        'labels.uuid as labelUUID',
        'categories.name as categoryName',
        'categories.uuid as categoryUUID',
        'entities.name as entityName',
        'entities.uuid as entityUUID',
        'supporting_packages.status as status',
      )
      .where( { entityID })

    if (txn) {
      query = query.transacting(txn)
    }

    const supportingPackages = await query
    return supportingPackages
  }

  public async getTasksByEntityIdAndAssigneeID({
    entityID,
    assigneeID,
    txn,
  }: {
    entityID: number
    assigneeID: number
    txn?: Knex.Transaction

  }): Promise<Task[]> {
    let query = this.#knex
      .withSchema('public')
      .table('tasks')
      .where({ entityID })
      .andWhere({ assigneeID })
      .select<Task[]>('*')

    if (txn) {
      query = query.transacting(txn)
    }

    return query
  }

}
