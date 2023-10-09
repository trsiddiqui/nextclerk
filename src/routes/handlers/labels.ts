import { $DepartmentService, $LabelService, $UserService } from '../../services'
import { NextFunction, Request, Response } from 'express'

export const getEntityLabels = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { entityUuid } = req.params
    const entityLabels = await $LabelService.getLabels({
      entityUuid
    })

    res.status(200).json(entityLabels)
  } catch (error) {
    next(error)
  }
}

export const archiveEntityLabel = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { customerXRefID, labelXRefID } = req.params
    const userXRefID = 'testUser'
    const archivedLabel = await $LabelService.archiveLabel({
      customerXRefID,
      labelXRefID,
      userXRefID
    })

    res.status(200).json(archivedLabel)
  } catch (error) {
    next(error)
  }
}

export const createLabel = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { customerXRefID } = req.params
    const userXRefID = 'testUser'
    const entityLabels = await $LabelService.createLabel({
      entityUuid: customerXRefID,
      labelRequest: req.body,
      userXRefID
    })

    res.status(201).json(entityLabels)
  } catch (error) {
    next(error)
  }
}



