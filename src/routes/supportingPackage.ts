import { Router } from 'express'
import SupportingPackagesHandler from '@/routes/handlers/supportingPackages'
import { Routes } from '@interfaces/routes.interface'
import { openApiValidatorMiddlewares } from './middlewares/validation'

class SupportingPackagesRoute implements Routes {
  public router = Router()
  supportingPackagesController = new SupportingPackagesHandler()

  constructor() {
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
    // this.router.post(
    //   `/supportingPackages`,
    //   this.supportingPackagesController.createSupportingPackage
    // )
    // this.router.put(
    //   `/supportingPackages/:id`,
    //   this.supportingPackagesController.updateSupportingPackage
    // )
    // this.router.delete(
    //   `/supportingPackages/:id`,
    //   this.supportingPackagesController.deleteSupportingPackage
    // )
    this.router.get(
      `/:customerXRefID/supporting-packages/lineItems/actions/createSheet`,
      this.supportingPackagesController.createLineItemsSheet
    )
  }
}

export default SupportingPackagesRoute
