import { $AccountService } from '../../services'
import { NextFunction, Request, Response } from 'express'

export const getEntityAccounts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // const { customerXRefID } = req.params
    // const entityAccounts = await $AccountService.getAccounts({
    //   customerXRefID
    // })
    // res.status(200).json(entityAccounts)
  } catch (error) {
    next(error)
  }
}
