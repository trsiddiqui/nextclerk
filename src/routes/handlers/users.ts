import { $UserService } from '../../services'
import { NextFunction, Request, Response } from 'express'

export const getEntityUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { customerXRefID } = req.params
    const { search } = req.query as { search?: string }
    const entityUsers = await $UserService.getEntitiesUsers({
      customerXRefID,
      search,
    })

    res.status(200).json(entityUsers)
  } catch (error) {
    next(error)
  }
}
