
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
      const taskByUUID = await this.getTaskByUuid({
        entityUuid,
        taskUuid: task.uuid
      })
      result.push(taskByUUID)
      // TODO: Majid same here
      // let assigneeName,assigneeEntity
      // if(task.assigneeID) {
      //   const assignee = await this.#userService.validateAndGetUsers({
      //     identifiers: {
      //       ids: [task.assigneeID.toString()]
      //     }
      //   })
      //   assigneeEntity = assignee.entries().next().value
      //   assigneeName = `${assigneeEntity[1].firstName} ${assigneeEntity[1].lastName}`
      // }

      // let supportingPackageEntity
      // if ( task.supportingPackageID) {
      //   const supportingPackage = await this.#supportingPackageService.validateAndGetSupportingPackages({
      //     identifiers: {
      //       ids: [task.supportingPackageID.toString()]
      //     }
      //   })
      //   supportingPackageEntity = supportingPackage.entries().next().value
      // }

      // const assigner = await this.#userService.validateAndGetUsers({
      //   identifiers: {
      //     ids: [task.assignerID.toString()]
      //   }
      // })
      // const assignerEntity = assigner.entries().next().value
      // const assignerName = `${assignerEntity[1].firstName} ${assignerEntity[1].lastName}`

      // const taskResult: TaskResponse = {
      //   entityName: entity.get(entityUuid).name,
      //   entityUUID: entity.get(entityUuid).uuid,
      //   categoryName: task.categoryName,
      //   categoryUUID: task.categoryUUID,
      //   supportingPackageUUID: supportingPackageEntity ? supportingPackageEntity[0] : null,
      //   label: task.label,
      //   labelUUID: task.labelUUID,
      //   date: task.date,
      //   dueDate: task.dueDate,
      //   assigneeName: assigneeName ?? null,
      //   assigneeUUID: assigneeEntity ? assigneeEntity[0] : null,
      //   description: task.description,
      //   isConfidential: task.isConfidential,
      //   isRecurring: task.isRecurring,
      //   title: task.title,
      //   archivedAt: task.archivedAt,
      //   archivedBy: task.archivedBy,
      //   createdAt: task.createdAt,
      //   createdBy: task.createdBy,
      //   updatedAt: task.updatedAt,
      //   updatedBy: task.updatedBy,
      //   assignerName,
      //   assignerUUID: assignerEntity[0],
      //   uuid: task.uuid,
      //   parentUuid: task.parentUuid,
      //   status: task.status
      // }
      // result.push(taskResult)
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

    let assigneeName,assigneeEntity
    if(task.assigneeID) {
      const assignee = await this.#userService.validateAndGetUsers({
        identifiers: {
          ids: [task.assigneeID.toString()]
        }
      })
      assigneeEntity = assignee.entries().next().value
      assigneeName = `${assigneeEntity[1].firstName} ${assigneeEntity[1].lastName}`
    }

    const assigner = await this.#userService.validateAndGetUsers({
      identifiers: {
        ids: [task.assignerID.toString()]
      }
    })
    const assignerEntity = assigner.entries().next().value
    const assignerName = `${assignerEntity[1].firstName} ${assignerEntity[1].lastName}`

    // let supportingPackageEntity
    // if ( task.supportingPackageID) {
    //   const supportingPackage = await this.#supportingPackageService.validateAndGetSupportingPackages({
    //     identifiers: {
    //       ids: [task.supportingPackageID.toString()]
    //     }
    //   })
    //   supportingPackageEntity = supportingPackage.entries().next().value
    // }

    const taskResult: TaskResponse = {
      id: task.id,
      entityName: entity.get(entityUuid).name,
      entityUUID: entity.get(entityUuid).uuid,
      supportingPackageUUID: task.supportingPackageUUID,
      categoryName: task.categoryName,
      categoryUUID: task.categoryUUID,
      label: task.label,
      labelUUID: task.labelUUID,
      date: task.date,
      dueDate: task.dueDate,
      assigneeName: assigneeName ?? null,
      assigneeUUID: assigneeEntity ? assigneeEntity[0] : null,
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
      parentUuid: task.parentUuid,
      status: task.status,
      taskStatus: task.taskStatus ?? null
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
      task.title != existingTask.title ||
      task.taskStatus != existingTask.taskStatus
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
        taskStatus,
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
      // let supportingPackage : Map<string, SupportingPackage>
      // if (supportingPackageUUID) {
      //   supportingPackage = await this.#supportingPackageService.validateAndGetSupportingPackages({
      //     identifiers: { uuids: [supportingPackageUUID]}
      //   })
      // }
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
          assigneeID: assignee.get(assigneeUUID).id,
          assignerID: assigner.get(assignerUUID).id,
          // supportingPackageID: supportingPackageUUID ? supportingPackage.get(supportingPackageUUID).id : null,
          taskStatus: taskStatus ?? null
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
      const taskByUUID = await this.getTaskByUuid({
        entityUuid,
        taskUuid: task.uuid
      })
      result.push(taskByUUID)
      // TODO: Majid change type for all to be same instead of calling another method above
      // const assignee = await this.#userService.validateAndGetUsers({
      //   identifiers: {
      //     ids: [task.assigneeID.toString()]
      //   }
      // })
      // const assigneeEntity = assignee.entries().next().value
      // const assigneeName = `${assigneeEntity[1].firstName} ${assigneeEntity[1].lastName}`
      // const assigner = await this.#userService.validateAndGetUsers({
      //   identifiers: {
      //     ids: [task.assignerID.toString()]
      //   }
      // })
      // const assignerEntity = assigner.entries().next().value
      // const assignerName = `${assignerEntity[1].firstName} ${assignerEntity[1].lastName}`

      // const taskResult: TaskResponse = {
      //   entityName: entity.get(entityUuid).name,
      //   entityUUID: entity.get(entityUuid).uuid,
      //   categoryName: task.categoryName,
      //   categoryUUID: task.categoryUUID,
      //   label: task.label,
      //   labelUUID: task.labelUUID,
      //   date: task.date,
      //   dueDate: task.dueDate,
      //   assigneeName,
      //   assigneeUUID: assigneeEntity[0],
      //   description: task.description,
      //   isConfidential: task.isConfidential,
      //   isRecurring: task.isRecurring,
      //   title: task.title,
      //   archivedAt: task.archivedAt,
      //   archivedBy: task.archivedBy,
      //   createdAt: task.createdAt,
      //   createdBy: task.createdBy,
      //   updatedAt: task.updatedAt,
      //   updatedBy: task.updatedBy,
      //   assignerName,
      //   assignerUUID: assignerEntity[0],
      //   uuid: task.uuid,
      //   parentUuid: task.parentUuid,
      //   status: task .status
      // }
      // result.push(taskResult)
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


    const assigner = await this.#userService.validateAndGetUsers({
      identifiers: { uuids: [assignerUUID]}
    })
    let assignee
    if (assigneeUUID) {
      assignee = await this.#userService.validateAndGetUsers({
        identifiers: { uuids: [assigneeUUID]}
      })
    }

    // let supportingPackage : Map<string, SupportingPackage>
    // if (supportingPackageUUID) {
    //   supportingPackage = await this.#supportingPackageService.validateAndGetSupportingPackages({
    //     identifiers: { uuids: [supportingPackageUUID]}
    //   })
    // }
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
        assigneeID: assigneeUUID ? parseInt(assignee.get(assigneeUUID).id) : null,
        assignerID: assigner.get(assignerUUID).id,
        // supportingPackageID: supportingPackageUUID ? supportingPackage.get(supportingPackageUUID).id : null,
      }
    })

    if (isRecurring) {

      const endDate = entity.get(entityUuid).endOfFinancialYear
      const endDateFormatted = DateTime.fromISO(new Date(endDate).toISOString())
      const dueDateFormatted = DateTime.fromISO(new Date(dueDate).toISOString())
      const { months } = endDateFormatted.diff( dueDateFormatted,'months').toObject()
      const FixedDiffMonths = Math.floor(months)
      for (let i = 1; i <= FixedDiffMonths ; i++ ) {
        const childUuid = v4()
        await this.#tasksManager.createTask({
          task: {
            uuid: childUuid,
            parentUuid: uuid,
            date,
            dueDate: dueDateFormatted.plus( { months: i}).toJSDate(), // DateTime.fromJSDate(dueDate).plus({months: i}).toJSDate(),
            description,
            title,
            isConfidential,
            isRecurring,
            categoryID: category.get(categoryUUID).id,
            labelID: label.get(labelUUID).id,
            entityID: entity.get(entityUuid).id,
            assigneeID: assigneeUUID?  parseInt(assignee.get(assigneeUUID).id): null,
            assignerID: assigner.get(assignerUUID).id,
            // supportingPackageID: supportingPackageUUID ? supportingPackage.get(supportingPackageUUID).id : null,
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

  public async deleteTaskByUuid({
    entityUuid,
    taskUuid,
    userXRefID,
  }: {
    entityUuid: string
    taskUuid: string
    userXRefID: string
  }): Promise<TaskResponse> {

    const entity = await this.#entityService.validateAndGetEntities({
      identifiers: { uuids: [entityUuid] },
    })

    const taskDBResponse = await this.#tasksManager.getTaskByUUID({
      uuid: taskUuid
    })

    const existingTask = taskDBResponse[0]

    if(!existingTask) {
      throw new Error("No Task with given UUID exist")
    }

    await this.#tasksManager.archiveTaskByIdentifier({
      entityID: entity.get(entityUuid).id.toString(),
      identifier: {
        taskUUID: existingTask.uuid
      },
      userXRefID,
    })

    const taskResult = await this.getTaskByUuid({
      entityUuid,
      taskUuid
    })

    return taskResult
  }



}
