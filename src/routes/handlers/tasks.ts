import { $TaskService } from '../../services'
import { NextFunction, Request, Response } from 'express'

export const getEntityTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { entityUuid } = req.params
    const entityTasks = await $TaskService.getTasks({
      entityUuid
    })

    res.status(200).json(entityTasks)
  } catch (error) {
    next(error)
  }
}

export const getEntityTaskByUuid = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { entityUuid, taskUuid } = req.params
    const task = await $TaskService.getTaskByUuid({
      entityUuid,
      taskUuid
    })

    res.status(200).json(task)
  } catch (error) {
    next(error)
  }
}

export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { entityUuid, taskUuid } = req.params
    const userXRefID = 'testUser'
    const updatedTask = await $TaskService.updateTaskByUuid({
      entityUuid,
      taskUuid,
      task: req.body,
      userXRefID,
    })

    res.status(200).json(updatedTask)
  } catch (error) {
    next(error)
  }
}

export const createEntityTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { entityUuid } = req.params
    const userXRefID = 'testUser'
    const entityTasks = await $TaskService.createTask({
      entityUuid,
      task: req.body,
      userXRefID
    })

    res.status(201).json(entityTasks)
  } catch (error) {
    next(error)
  }
}


