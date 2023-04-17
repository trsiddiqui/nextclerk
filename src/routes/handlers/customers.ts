import { $CustomerService, $UserService } from '../../services'
import { NextFunction, Request, Response } from 'express'

export const getEntityCustomers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { customerXRefID } = req.params
    const entityCustomers = await $CustomerService.getCustomers({
      customerXRefID
    })

    res.status(200).json(entityCustomers)
  } catch (error) {
    next(error)
  }
}


