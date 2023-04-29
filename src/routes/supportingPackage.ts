import { Router } from 'express'
import {
  createSupportingPackage,
  createLineItemsSheet,
  getLineItemSheetContent,
  updateSupportingPackage,
  getSupportingPackage,
  getCategories,
} from '../routes/handlers/supportingPackages'
import { Routes } from '../interfaces/routes.interface'
import { openApiValidatorMiddlewares } from './middlewares/validation'
import { getEntityUsers } from './handlers/users'
import { syncIntegrationData } from './handlers/integrations'
import { getEntityDepartments } from './handlers/departments'
import { getEntityLocations } from './handlers/locations'
import { getEntityCustomers } from './handlers/customers'
import { getEntityAccounts } from './handlers/accounts'

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

router.get(`/supporting-packages/categories`, getCategories)

router.get(`/:customerXRefID/users`, getEntityUsers)

router.get(`/:customerXRefID/departments`, getEntityDepartments)

router.get(`/:customerXRefID/locations`, getEntityLocations)

router.get(`/:customerXRefID/accounts`, getEntityAccounts)

router.get(`/:customerXRefID/customers`, getEntityCustomers)

router.get(`/:customerXRefID/syncIntegrationData`, syncIntegrationData)

router.post(`/:customerXRefID/supporting-packages`, createSupportingPackage)
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
