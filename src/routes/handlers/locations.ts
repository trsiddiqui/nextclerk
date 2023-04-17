import { $LocationService, $UserService } from '../../services'
import { NextFunction, Request, Response } from 'express'

export const getEntityLocations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { customerXRefID } = req.params
    const entityLocations = await $LocationService.getLocations({
      customerXRefID
    })

    res.status(200).json(entityLocations)
  } catch (error) {
    next(error)
  }
}


