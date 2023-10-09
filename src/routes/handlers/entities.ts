import { $DepartmentService, $EntityService, $LabelService, $UserService } from '../../services'
import { NextFunction, Request, Response } from 'express'

export const getEntity = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { entityUuid } = req.params
    const entity = await $EntityService.validateAndGetEntities({
      identifiers: {
        uuids: [entityUuid]
      }
    })
    if (entity.size < 1) {
      res.status(404)
    }else {
      res.status(200).json(entity.get(entityUuid))
    }
  } catch (error) {
    next(error)
  }
}

export const updateEntity = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { entityUuid } = req.params
    const userXRefID = 'testUser'
    const updatedEntity = await $EntityService.updateEntityByUuid({
      entityUuid,
      entity: req.body,
      userXRefID,
    })

    res.status(200).json(updateEntity)
  } catch (error) {
    next(error)
  }
}
