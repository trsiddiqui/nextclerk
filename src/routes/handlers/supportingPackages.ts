import { NextFunction, Request, Response } from 'express'
import { SupportingPackage } from '../../types/supportingPackage'
import { $SupportingPackageService } from '../../services'

export const createLineItemsSheet = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customerXRefID = req.params.customerXRefID
    const sharedFilePath = await $SupportingPackageService.createLineItemsSheet(customerXRefID)
    res.status(201).send(sharedFilePath)
  } catch (error) {
    next(error)
  }
}

export const getLineItemSheetContent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customerXRefID = req.params.customerXRefID
    const supportingPackageXRefID = req.params.supportingPackageXRefID
    const lineItemsSheetData = await $SupportingPackageService.getLineItemsSheetContent(
      customerXRefID,
      supportingPackageXRefID
    )
    res.writeHead(200, [
      ['Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    ])
    res.end(Buffer.from(lineItemsSheetData as string, 'base64'))
  } catch (error) {
    next(error)
  }
}

// public getSupportingPackages = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const findAllSupportingPackagesData: SupportingPackage[] =
//       await this.supportingPackageService.findAllSupportingPackage()

//     res.status(200).json({ data: findAllSupportingPackagesData, message: 'findAll' })
//   } catch (error) {
//     next(error)
//   }
// }

// public getSupportingPackageById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   try {
//     const supportingPackageId = Number(req.params.id)
//     const findOneSupportingPackageData: SupportingPackage = await this.supportingPackageService.findSupportingPackageById(
//       supportingPackageId
//     )

//     res.status(200).json({ data: findOneSupportingPackageData, message: 'findOne' })
//   } catch (error) {
//     next(error)
//   }
// }

// public createSupportingPackage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   try {
//     const supportingPackageData: SupportingPackage = req.body
//     const createSupportingPackageData: SupportingPackage = await this.supportingPackageService.createSupportingPackage(
//       supportingPackageData
//     )

//     res.status(201).json({ data: createSupportingPackageData, message: 'created' })
//   } catch (error) {
//     next(error)
//   }
// }

// public updateSupportingPackage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   try {
//     const supportingPackageId = Number(req.params.id)
//     const supportingPackageData: SupportingPackage = req.body
//     const updateSupportingPackageData: SupportingPackage = await this.supportingPackageService.updateSupportingPackage(
//       supportingPackageId,
//       supportingPackageData
//     )

//     res.status(200).json({ data: updateSupportingPackageData, message: 'updated' })
//   } catch (error) {
//     next(error)
//   }
// }

// public deleteSupportingPackage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   try {
//     const supportingPackageId = Number(req.params.id)
//     const deleteSupportingPackageData: SupportingPackage = await this.supportingPackageService.deleteSupportingPackage(
//       supportingPackageId
//     )

//     res.status(200).json({ data: deleteSupportingPackageData, message: 'deleted' })
//   } catch (error) {
//     next(error)
//   }
// }

export const createSupportingPackage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const supportingPackageRequest = req.body
    const { customerXRefID } = req.params
    const userXRefID = 'testUser'

    const supportingPackage = await $SupportingPackageService.createSupportingPackage({
      customerXRefID,
      supportingPackageRequest,
      userXRefID,
    })

    res.status(201).json(supportingPackage)
  } catch (error) {
    next(error)
  }
}

export const updateSupportingPackage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const supportingPackageRequest = req.body
    const { customerXRefID, supportingPackageUUID } = req.params
    const userXRefID = 'testUser'

    const updatedSupportingPackage = await $SupportingPackageService.updateSupportingPackage({
      customerXRefID,
      supportingPackageUUID,
      supportingPackageRequest,
      userXRefID,
    })

    res.status(200).json(updatedSupportingPackage)
  } catch (error) {
    next(error)
  }
}

export const getSupportingPackage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { customerXRefID, supportingPackageUUID } = req.params

    const supportingPackage = await $SupportingPackageService.getSupportingPackage({
      customerXRefID,
      supportingPackageUUID,
    })

    res.status(200).json(supportingPackage)
  } catch (error) {
    next(error)
  }
}

