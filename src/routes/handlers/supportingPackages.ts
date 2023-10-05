import { NextFunction, Request, Response } from 'express'
import { Knex } from 'knex'
import {
  $CategoryService,
  $SupportingPackageCommunicationService,
  $SupportingPackageService,
} from '../../services'
import { SupportingPackageCommunicationRequest, SupportingPackageRequest } from '@/types'
import { redis } from '@/server'

export const createLineItemsSheet = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customerXRefID = req.params.customerXRefID
    const sharedFilePath = await $SupportingPackageService.createLineItemsSheet(customerXRefID)
    // deepcode ignore XSS: <please specify a reason of ignoring this>
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
    const supportingPackageRequest: SupportingPackageRequest = req.body
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
    console.log(supportingPackage)
    res.status(200).json(supportingPackage)
  } catch (error) {
    next(error)
  }
}

export const createSupportingPackageCommunication = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { customerXRefID, supportingPackageUUID } = req.params
    const supportingPackageCommunication: SupportingPackageCommunicationRequest = req.body

    const supportingPackageCommunicationResponse =
      await $SupportingPackageService.createSupportingPackageCommunication({
        communication: supportingPackageCommunication,
        customerXRefID,
        supportingPackageUUID,
        userXRefID: 'testUser',
      })

    res.status(200).json(supportingPackageCommunicationResponse)
  } catch (error) {
    next(error)
  }
}

export const getSupportingPackageCommunicationByCommunicationUUID = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { supportingPackageUUID, communicationUUID } = req.params

    const supportingPackageCommunicationResponse =
      await $SupportingPackageCommunicationService.getSupportingPackageCommunicationsBySupportingPackageIdAndCommunicationUUID(
        {
          communicationUUIDs: [communicationUUID],
          supportingPackageId: parseInt(supportingPackageUUID), // TODO: fix here for id instead of UUID
        }
      )

    res.status(200).json(supportingPackageCommunicationResponse)
  } catch (error) {
    next(error)
  }
}

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await $CategoryService.getCategories()

    res.status(200).json(categories)
  } catch (error) {
    next(error)
  }
}

export const postJournalEntryToERP = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { customerXRefID, supportingPackageUUID } = req.params

    const ERPjournalEntrySuccess = await $SupportingPackageService.postToERP({
      journalEntryLines: req.body,
      customerXRefID,
      supportingPackageUUID,
      userXRefID: 'testUser',
    })
    if (ERPjournalEntrySuccess) {
      res.status(200).json(ERPjournalEntrySuccess)
    } else {
      res.send(400).json(ERPjournalEntrySuccess)
    }
  } catch (error) {
    next(error)
  }
}

export const getAndReserveSupportingPackageNumber = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { customerXRefID } = req.params
  let reservedNumber
  const lastUsedNumber = await redis.get(`supporting-package-number-${customerXRefID}`)
  if (lastUsedNumber == null) {
    reservedNumber = 1
  } else {
    reservedNumber = parseInt(lastUsedNumber) + 1
  }
  await redis.set(`supporting-package-number-${customerXRefID}`, reservedNumber)
  res.status(200).json(reservedNumber)
}

export const getAndReserveJournalEntryNumber = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { customerXRefID } = req.params
  let reservedNumber
  const lastUsedNumber = await redis.get(`journal-entry-number-${customerXRefID}`)
  if (lastUsedNumber == null) {
    reservedNumber = 1
  } else {
    reservedNumber = parseInt(lastUsedNumber) + 1
  }
  await redis.set(`journal-entry-number-${customerXRefID}`, reservedNumber)
  res.status(200).json(reservedNumber)
}

// export const updateJournalEntries = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const { customerXRefID, supportingPackageUUID } = req.params
//     const { journalEntryLines } = req.body

//     const journalEntryLinesResponse =
//       await $SupportingPackageService.updateSupportingPackageJournalEntries({
//         journalEntryLines,
//         customerXRefID,
//         supportingPackageUUID,
//         userXRefID: 'testUser',
//       })

//     res.status(200).json(journalEntryLinesResponse)
//   } catch (error) {
//     next(error)
//   }
// }

// export const deleteJournalEntries = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const { customerXRefID, supportingPackageUUID } = req.params
//     const { journalEntryLines } = req.body

//     const journalEntryLinesResponse =
//       await $SupportingPackageService.deleteSupportingPackageJournalEntries({
//         journalEntryLines,
//         customerXRefID,
//         supportingPackageUUID,
//         userXRefID: 'testUser',
//       })

//     res.status(204).json(journalEntryLinesResponse)
//   } catch (error) {
//     next(error)
//   }
// }

// export const getJournalEntries = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const { supportingPackageUUID } = req.params

//     const journalEntryLinesResponse =
//       await $SupportingPackageService.getJournalEntryBySupportingPackageId({
//         supportingPackageUUID,
//       })

//     res.status(200).json(journalEntryLinesResponse)
//   } catch (error) {
//     next(error)
//   }
// }
