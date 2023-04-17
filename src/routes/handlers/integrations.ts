import { $IntegrationService } from '../../services'
import { NextFunction, Request, Response } from 'express'

export const syncIntegrationData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { customerXRefID } = req.params
    const entityUsers = await $IntegrationService.syncIntegrationData({
      customerXRefID
    })

    res.status(200)
  } catch (error) {
    next(error)
  }
}



