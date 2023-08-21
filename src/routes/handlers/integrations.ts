import { $IntegrationService } from '../../services'
import { NextFunction, Request, Response } from 'express'

export const syncIntegrationData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { customerXRefID } = req.params
    const realmId = '4620816365325240560'
    const userXRefID = 'test User'
    await $IntegrationService.syncIntegrationData({
      customerXRefID,
      realmId,
      userXRefID
    })

    // Redirect the authUri
   // res.redirect(authUri)
    res.sendStatus(200)

    // res.status(200)
  } catch (error) {
    next(error)
  }
}
