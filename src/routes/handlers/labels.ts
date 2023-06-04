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


