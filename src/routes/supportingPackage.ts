import { Router } from 'express'
import  multer  from 'multer'
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
import { Uploader } from './handlers/uploader'

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, './uploads/')
  },

  filename: function (req: any, file: any, cb: any) {
      cb(null, file.originalname)
  }
})

const fileFilter = (req: any,file: any,cb: any) => {
  if(file.mimetype === "image/jpg"  ||
     file.mimetype === "image/jpeg"  ||
     file.mimetype ===  "application/pdf" ||
     file.mimetype ===  "application/vnd.ms-excel" ||
     file.mimetype ===  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
     {
      cb(null, true)
     } else {
      cb(new Error("upload file is not of type jpg/jpeg or Excel or pdf file"),false)

  }
}

const upload = multer({storage: storage, fileFilter : fileFilter})


const router = Router()


router.post(`/:customerXRefID/supporting-packages/upload`, upload.single('file'), Uploader.Upload);

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
