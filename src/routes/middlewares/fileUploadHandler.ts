import path from 'path'
import AWS, { S3 } from 'aws-sdk'
import express, { ErrorRequestHandler, RequestHandler } from 'express'
import multer, { StorageEngine } from 'multer'
// import multerS3 from 'multer-s3'
import { v4 } from 'uuid'

// const s3Config = {
//   accessKeyId: '',
//   secretAccessKey: '',
//   region: '',
//   endpoint: '', // endpoint is automatically generated with region if we use a real Amazon S3 rather than localstack.
//   s3ForcePathStyle: true, // without this option, localstack's endpoint does not work. With real Amazon S3, this works fine as long as endpoint is undefined.
// }

// const s3Instance = new AWS.S3(s3Config)

const bucketName = ''

const MULTER_FILE_TOO_LARGE_ERROR = 'LIMIT_FILE_SIZE'

export enum S3OPTIONS_ACL {
  PUBLIC_READ_WRITE = 'public-read-write',
  PUBLIC_READ = 'public-read',
  PRIVATE = 'private',
}

export enum multerStorageDestinations {
  AWS_S3 = 'AWS_S3',
  MEMORY = 'MEMORY',
}

interface StorageDetails {
  destination: multerStorageDestinations
  awsS3ACL?: S3OPTIONS_ACL
  awsS3Bucket?: string
  awsS3Instance?: S3
}

interface MulterFileOptions {
  allowedExtensions: string[]
  storage: StorageDetails
  maxFileSize: number
  formDataKey: string
}

const getMulterStorageEngine = (storageOptions: StorageDetails): StorageEngine => {
  // if (storageOptions.destination === multerStorageDestinations.AWS_S3) {
  //   return multerS3({
  //     bucket: storageOptions.awsS3Bucket ?? bucketName,
  //     acl: storageOptions.awsS3ACL ?? S3OPTIONS_ACL.PRIVATE,
  //     s3: storageOptions.awsS3Instance,
  //     key(
  //       req: express.Request,
  //       file: Express.Multer.File,
  //       cb: (arg1: unknown, key?: string | undefined) => void
  //     ) {
  //       // TODO > for now we use baseXRefID as a fallback in case we dont have venueXRefID
  //       // In the future, we'll use baseXRefID as default
  //       const { venueXRefID, baseXRefID } = req.params
  //       cb(null, `${venueXRefID ?? baseXRefID}_${v4()}${path.extname(file.originalname)}`)
  //     },
  //   })
  // }
  return multer.memoryStorage()
}

export const middlewareMulterFileHandler = ({
  allowedExtensions,
  maxFileSize,
  formDataKey,
  storage,
}: MulterFileOptions): RequestHandler => {
  const upload = multer({
    limits: { fileSize: maxFileSize },
    fileFilter: (
      req: express.Request,
      file: Express.Multer.File,
      cb: (error: unknown, metadata?: unknown) => void
    ) => {
      const extension = path.extname(file.originalname).toLowerCase()
      if (allowedExtensions.indexOf(extension) > -1) {
        cb(null, true)
      } else {
        cb(new Error(`File extension ${extension} is not allowed to upload.`))
      }
    },
    storage: getMulterStorageEngine(storage),
  })
  return upload.single(formDataKey)
}

export const middlewareMulterErrorHandler = (
  err: Error,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void => {
  if (err) {
    if (err instanceof multer.MulterError && err.code === MULTER_FILE_TOO_LARGE_ERROR) {
      const multerError = new Error('Requested file size exceeds the allowed size')
      next(multerError)
    }
    next(err)
  } else {
    next()
  }
}

export const middlewareFileHandler = (
  options: MulterFileOptions
): Array<RequestHandler | ErrorRequestHandler> => [
  middlewareMulterFileHandler(options),
  middlewareMulterErrorHandler,
]
