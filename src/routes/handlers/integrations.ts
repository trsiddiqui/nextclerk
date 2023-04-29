import { $IntegrationService } from '../../services'
import { NextFunction, Request, Response } from 'express'

export const syncIntegrationData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { customerXRefID } = req.params
    const authUri = await $IntegrationService.syncIntegrationData({
      customerXRefID,
    })

    // Redirect the authUri
    res.redirect(authUri)

    // res.status(200)
  } catch (error) {
    next(error)
  }
}
