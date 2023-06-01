import { Router } from 'express'
import { middlewareFileHandler, multerStorageDestinations } from './middlewares/fileUploadHandler'
import { Uploader } from './handlers/uploader'

const router = Router()

// Uploads an image
// OBS.: Needs to go BEFORE openApiValidatorMiddlewares
router.post(
  '/:customerXRefID/actions/upload-file',
  middlewareFileHandler({
    allowedExtensions: ['.xlsx', '.jpg', '.jpeg', '.png', '.pdf', '.docx'],
    maxFileSize: 5 * 1024 * 1024, // 5Mb
    formDataKey: 'file',
    storage: {
      destination: multerStorageDestinations.MEMORY,
    },
  }),
  // TODO: Replace the following handler with multer storage to s3 native, commented inside the file upload middleware
  Uploader.Upload
)

router.post(`/:customerXRefID/files/:fileUUID`, Uploader.chooseMasterFile)

router.post(`/:customerXRefID/files`, Uploader.createMasterFileInSharepoint)

router.get(`/:customerXRefID/files/:fileUUID`, Uploader.getFileFromSharepoint)

router.put(
  `/:customerXRefID/files/:fileUUID`,
  middlewareFileHandler({
    allowedExtensions: ['.xlsx', '.jpg', '.jpeg', '.png', '.pdf', '.docx'],
    maxFileSize: 5 * 1024 * 1024, // 5Mb
    formDataKey: 'file',
    storage: {
      destination: multerStorageDestinations.MEMORY,
    },
  }),
  Uploader.updateContentsOfFile
)

// router.get(`/testing`, Uploader.testing)

export default router
