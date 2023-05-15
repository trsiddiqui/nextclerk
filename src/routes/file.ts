import { Router } from 'express'
import { middlewareFileHandler, multerStorageDestinations } from './middlewares/fileUploadHandler'
import { Uploader } from './handlers/uploader'

const router = Router()

// Uploads an image
// OBS.: Needs to go BEFORE openApiValidatorMiddlewares
router.post(
  '/actions/upload-file',
  middlewareFileHandler({
    allowedExtensions: ['.jpg', '.jpeg', '.png'],
    maxFileSize: 5 * 1024 * 1024, // 5Mb
    formDataKey: 'image',
    storage: {
      destination: multerStorageDestinations.MEMORY,
    },
  }),
  // TODO: Replace the following handler with multer storage to s3 native, commented inside the file upload middleware
  Uploader.Upload
)

export default router
