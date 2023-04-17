import { $DepartmentService, $UserService } from '../../services'
import { NextFunction, Request, Response } from 'express'

export const getEntityDepartments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { customerXRefID } = req.params
    const entityDepartments = await $DepartmentService.getDepartments({
      customerXRefID
    })

    res.status(200).json(entityDepartments)
  } catch (error) {
    next(error)
  }
}


