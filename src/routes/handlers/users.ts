import { $UserService } from '../../services'
import { NextFunction, Request, Response } from 'express'
import { Knex } from 'knex'

export const getEntityUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { customerXRefID } = req.params
    const entityUsers = await $UserService.getEntitiesUsers({
      customerXRefID
    })

    res.status(200).json(entityUsers)
  } catch (error) {
    next(error)
  }
}


