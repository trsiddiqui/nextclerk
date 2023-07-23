
import { v4 } from 'uuid'
import { DateTime } from 'luxon'
import { DepartmentsManager, TasksManager } from '../models'
import { Department, SupportingPackage, TaskRequest, TaskResponse } from '../types'
import CategoryService from './categories.service'
import EntityService from './entities.service'
import LabelService from './labels.service'
import SupportingPackageService from './supportingPackages.service'
import UserService from './user.service'

export default class TaskService {

  #tasksManager: TasksManager

  #entityService: EntityService

  #userService: UserService

  #categoryService: CategoryService

  #labelService: LabelService

  #supportingPackageService: SupportingPackageService

  constructor({
    tasksManager,
    entityService,
    userService,
    categoryService,
    labelService,
    supportingPackageService,
  }: {
    tasksManager: TasksManager
    entityService: EntityService
    userService: UserService
    categoryService: CategoryService
    labelService: LabelService
    supportingPackageService: SupportingPackageService
  }) {
    this.#tasksManager = tasksManager
    this.#entityService = entityService
    this.#userService = userService
    this.#categoryService = categoryService
    this.#labelService = labelService
    this.#supportingPackageService = supportingPackageService
  }


  public async getTasks({
    entityUuid
  }: {
    entityUuid: string
  }): Promise<TaskResponse[]> {

    const entity = await this.#entityService.validateAndGetEntities({
      identifiers: { uuids: [entityUuid] },
    })

    const tasks = await this.#tasksManager.getTasksByEntityId({
      entityID: entity.get(entityUuid).id,
    })

    const result: TaskResponse[] = []

    for (const task of tasks) {
      const assignee = await this.#userService.validateAndGetUsers({
        identifiers: {
          ids: [task.assigneeID.toString()]
        }
      })
      const assigneeUUID = assignee.entries().next().value
      const assigneeName = `${assignee.get(assigneeUUID).firstName}  ${assignee.get(assigneeUUID).lastName}`
      const assigner = await this.#userService.validateAndGetUsers({
        identifiers: {
          ids: [task.assignerID.toString()]
        }
      })
      const assignerUUID = assigner.entries().next().value
      const assignerName = `${assigner.get(assignerUUID).firstName}  ${assigner.get(assignerUUID).lastName}`

      const taskResult: TaskResponse = {
        entityName: entity.get(entityUuid).name,
        entityUUID: entity.get(entityUuid).uuid,
        categoryName: task.categoryName,
        categoryUUID: task.categoryUUID,
        label: task.label,
        labelUUID: task.labelUUID,
        date: task.date,
        assigneeName,
        assigneeUUID,
        description: task.description,
        isConfidential: task.isConfidential,
        isRecurring: task.isRecurring,
        title: task.title,
        archivedAt: task.archivedAt,
        archivedBy: task.archivedBy,
        createdAt: task.createdAt,
        createdBy: task.createdBy,
        updatedAt: task.updatedAt,
        updatedBy: task.updatedBy,
        assignerName,
        assignerUUID,
        uuid: task.uuid,
      }
      result.push(taskResult)
    }

    return result
  }

  public async getTaskByUuid({
    entityUuid,
    taskUuid
  }: {
    entityUuid: string
    taskUuid: string
  }): Promise<TaskResponse> {

    const entity = await this.#entityService.validateAndGetEntities({
      identifiers: { uuids: [entityUuid] },
    })

    const taskDBResponse = await this.#tasksManager.getTaskByUUID({
      uuid: taskUuid
    })

    const task = taskDBResponse[0]

    const assignee = await this.#userService.validateAndGetUsers({
      identifiers: {
        ids: [task.assigneeID.toString()]
      }
    })
    const assigneeEntity = assignee.entries().next().value
    const assigneeName = `${assigneeEntity[1].firstName} ${assigneeEntity[1].lastName}`
    const assigner = await this.#userService.validateAndGetUsers({
      identifiers: {
        ids: [task.assignerID.toString()]
      }
    })
    const assignerEntity = assigner.entries().next().value
    const assignerName = `${assignerEntity[1].firstName} ${assignerEntity[1].lastName}`

    const taskResult: TaskResponse = {
      entityName: entity.get(entityUuid).name,
      entityUUID: entity.get(entityUuid).uuid,
      categoryName: task.categoryName,
      categoryUUID: task.categoryUUID,
      label: task.label,
      labelUUID: task.labelUUID,
      date: task.date,
      assigneeName,
      assigneeUUID: assigneeEntity[0],
      description: task.description,
      isConfidential: task.isConfidential,
      isRecurring: task.isRecurring,
      title: task.title,
      archivedAt: task.archivedAt,
      archivedBy: task.archivedBy,
      createdAt: task.createdAt,
      createdBy: task.createdBy,
      updatedAt: task.updatedAt,
      updatedBy: task.updatedBy,
      assignerName,
      assignerUUID: assignerEntity[0],
      uuid: task.uuid,
    }

    return taskResult
  }

  public async updateTaskByUuid({
    entityUuid,
    taskUuid,
    task,
    userXRefID,
  }: {
    entityUuid: string
    taskUuid: string
    task: TaskRequest
    userXRefID: string
  }): Promise<TaskResponse> {

    const entity = await this.#entityService.validateAndGetEntities({
      identifiers: { uuids: [entityUuid] },
    })

    const taskDBResponse = await this.#tasksManager.getTaskByUUID({
      uuid: taskUuid
    })

    const existingTask = taskDBResponse[0]

    const assignee = await this.#userService.validateAndGetUsers({
      identifiers: {
        ids: [existingTask.assigneeID.toString()]
      }
    })
    const existingAssigneeEntity = assignee.entries().next().value

    const assigner = await this.#userService.validateAndGetUsers({
      identifiers: {
        ids: [existingTask.assignerID.toString()]
      }
    })
    const existingAssignerEntity = assigner.entries().next().value

    const label = await this.#labelService.validateAndGetLabels({
      identifiers: {
        ids: [existingTask.labelID.toString()]
      }
    })
    const existingLabelEntity = label.entries().next().value

    const category = await this.#categoryService.validateAndGetCategories({
      identifiers: {
        ids: [existingTask.categoryID.toString()]
      }
    })
    const existingCategoryEntity = category.entries().next().value
    if (
      task.assigneeUUID != existingAssigneeEntity[0] ||
      task.assignerUUID != existingAssignerEntity[0] ||
      task.categoryUUID != existingCategoryEntity[0] ||
      task.labelUUID != existingLabelEntity[0] ||
      task.date != existingTask.date ||
      task.dueDate!= existingTask.dueDate ||
      task.isConfidential != existingTask.isConfidential ||
      task.description != existingTask.description ||
      task.title != existingTask.title
    )
    {
      const {
        assigneeUUID,
        assignerUUID,
        categoryUUID,
        labelUUID,
        supportingPackageUUID,
        date,
        dueDate,
        description,
        isConfidential,
        isRecurring,
        title,
      } = task

      const entity = await this.#entityService.validateAndGetEntities({
        identifiers: { uuids: [entityUuid] },
      })

      const category = await this.#categoryService.validateAndGetCategories({
        identifiers: { uuids:[categoryUUID] }
      })

      const label = await this.#labelService.validateAndGetLabels({
        identifiers: { uuids:[labelUUID] }
      })

      const assignee = await this.#userService.validateAndGetUsers({
        identifiers: { uuids: [assigneeUUID]}
      })

      const assigner = await this.#userService.validateAndGetUsers({
        identifiers: { uuids: [assignerUUID]}
      })
      let supportingPackage : Map<string, SupportingPackage>
      if (supportingPackageUUID) {
        supportingPackage = await this.#supportingPackageService.validateAndGetSupportingPackages({
          identifiers: { uuids: [supportingPackageUUID]}
        })
      }
      const updatedTask = await this.#tasksManager.updateTask({
        userXRefID,
        identifier: {
          taskUUID: taskUuid
        },
        entityID: entity.get(entityUuid).id,
        task: {
          date,
          dueDate,
          description,
          title,
          isConfidential,
          isRecurring,
          categoryID: category.get(categoryUUID).id,
          labelID: label.get(labelUUID).id,
          entityID: entity.get(entityUuid).id,
          assigneeID: parseInt(assignee.get(assigneeUUID).id),
          assignerID: parseInt(assigner.get(assignerUUID).id),
          supportingPackageID: supportingPackageUUID ? supportingPackage.get(supportingPackageUUID).id : null,
        }
      })
    }
    const taskResult = await this.getTaskByUuid({
      entityUuid,
      taskUuid
    })

    return taskResult
  }

  public async getTaskByParentUuid({
    entityUuid,
    parentUuid
  }: {
    entityUuid: string
    parentUuid: string
  }): Promise<TaskResponse[]> {

    const entity = await this.#entityService.validateAndGetEntities({
      identifiers: { uuids: [entityUuid] },
    })

    const tasks = await this.#tasksManager.getTasksByParentUUID({
      uuid: parentUuid
    })

    const result: TaskResponse [] = []
    for ( const task of tasks) {
      const assignee = await this.#userService.validateAndGetUsers({
        identifiers: {
          ids: [task.assigneeID.toString()]
        }
      })
      const assigneeEntity = assignee.entries().next().value
      const assigneeName = `${assigneeEntity[1].firstName} ${assigneeEntity[1].lastName}`
      const assigner = await this.#userService.validateAndGetUsers({
        identifiers: {
          ids: [task.assignerID.toString()]
        }
      })
      const assignerEntity = assigner.entries().next().value
      const assignerName = `${assignerEntity[1].firstName} ${assignerEntity[1].lastName}`

      const taskResult: TaskResponse = {
        entityName: entity.get(entityUuid).name,
        entityUUID: entity.get(entityUuid).uuid,
        categoryName: task.categoryName,
        categoryUUID: task.categoryUUID,
        label: task.label,
        labelUUID: task.labelUUID,
        date: task.date,
        assigneeName,
        assigneeUUID: assigneeEntity[0],
        description: task.description,
        isConfidential: task.isConfidential,
        isRecurring: task.isRecurring,
        title: task.title,
        archivedAt: task.archivedAt,
        archivedBy: task.archivedBy,
        createdAt: task.createdAt,
        createdBy: task.createdBy,
        updatedAt: task.updatedAt,
        updatedBy: task.updatedBy,
        assignerName,
        assignerUUID: assignerEntity[0],
        uuid: task.uuid,
      }
      result.push(taskResult)
    }

    return result
  }


  public async createTask({
    entityUuid,
    task,
    userXRefID
  }: {
    entityUuid: string
    task: TaskRequest
    userXRefID: string
  }): Promise<TaskResponse[]> {

    const {
      assigneeUUID,
      assignerUUID,
      categoryUUID,
      labelUUID,
      supportingPackageUUID,
      date,
      dueDate,
      description,
      isConfidential,
      isRecurring,
      title,
    } = task

    const entity = await this.#entityService.validateAndGetEntities({
      identifiers: { uuids: [entityUuid] },
    })

    const category = await this.#categoryService.validateAndGetCategories({
      identifiers: { uuids:[categoryUUID] }
    })

    const label = await this.#labelService.validateAndGetLabels({
      identifiers: { uuids:[labelUUID] }
    })

    const assignee = await this.#userService.validateAndGetUsers({
      identifiers: { uuids: [assigneeUUID]}
    })

    const assigner = await this.#userService.validateAndGetUsers({
      identifiers: { uuids: [assignerUUID]}
    })


    let supportingPackage : Map<string, SupportingPackage>
    if (supportingPackageUUID) {
      supportingPackage = await this.#supportingPackageService.validateAndGetSupportingPackages({
        identifiers: { uuids: [supportingPackageUUID]}
      })
    }
    const uuid = v4()

    const createdTask = await this.#tasksManager.createTask({
      userXRefID,
      task: {
        uuid,
        parentUuid: uuid,
        date,
        dueDate,
        description,
        title,
        isConfidential,
        isRecurring,
        categoryID: category.get(categoryUUID).id,
        labelID: label.get(labelUUID).id,
        entityID: entity.get(entityUuid).id,
        assigneeID: parseInt(assignee.get(assigneeUUID).id),
        assignerID: parseInt(assigner.get(assignerUUID).id),
        supportingPackageID: supportingPackageUUID ? supportingPackage.get(supportingPackageUUID).id : null,
      }
    })

    if (isRecurring) {
      const { months } = DateTime.fromJSDate(date).diff(entity.get(entityUuid).endOfFinancialYear, 'months').toObject()
      for (let i = 1; i < months ; i++ ) {
        const childUuid = v4()
        await this.#tasksManager.createTask({
          task: {
            uuid: childUuid,
            parentUuid: uuid,
            date: DateTime.fromJSDate(date).plus({months: i}).toJSDate(),
            dueDate: DateTime.fromJSDate(dueDate).plus({months: i}).toJSDate(),
            description,
            title,
            isConfidential,
            isRecurring,
            categoryID: category.get(categoryUUID).id,
            labelID: label.get(labelUUID).id,
            entityID: entity.get(entityUuid).id,
            assigneeID: parseInt(assignee.get(assigneeUUID).id),
            assignerID: parseInt(assigner.get(assignerUUID).id),
            supportingPackageID: supportingPackageUUID ? supportingPackage.get(supportingPackageUUID).id : null,
        },
        userXRefID
      })
      }

    }
    return this.getTaskByParentUuid({
      entityUuid,
      parentUuid: uuid
    })
  }



}
