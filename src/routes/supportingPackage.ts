import { Router } from 'express'
import multer from 'multer'
import {
  createSupportingPackage,
  createLineItemsSheet,
  getLineItemSheetContent,
  updateSupportingPackage,
  getSupportingPackage,
} from '../routes/handlers/supportingPackages'

const router = Router()

// http://localhost:3000/customerXRefID/supporting-packages/123/lineItems/sheet

router.get(
  `/:customerXRefID/supporting-packages/:supportingPackageXRefID/lineItems/sheet`,
  getLineItemSheetContent
)

router.get(
  `/:customerXRefID/supporting-packages/lineItems/actions/createSheet`,
  createLineItemsSheet
)

router.post(`/:customerXRefID/supporting-packages/`, createSupportingPackage)
router.put(`/:customerXRefID/supporting-packages/:supportingPackageUUID`, updateSupportingPackage)
router.get(`/:customerXRefID/supporting-packages/:supportingPackageUUID`, getSupportingPackage)

// this.router.use(
//   ...openApiValidatorMiddlewares({
//     apiSpec: 'openapi.yaml',
//     validateResponses: true, // this should take care of the responses in tests
//     validateApiSpec: true,
//     validateRequests: true,
//   })
// )
// this.router.get(`/supportingPackages`, this.supportingPackagesController.getSupportingPackages)
// this.router.get(
//   `/supportingPackages/:id`,
//   this.supportingPackagesController.getSupportingPackageById
// )

// this.router.put(
//   `/supportingPackages/:id`,
//   this.supportingPackagesController.updateSupportingPackage
// )
// this.router.delete(
//   `/supportingPackages/:id`,
//   this.supportingPackagesController.deleteSupportingPackage
// )

export default router
