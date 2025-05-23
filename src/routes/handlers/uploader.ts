import { S3 } from 'aws-sdk'
import { Request, Response } from 'express'
import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } from '@/config'
import { $FileService } from '@/services'
import {
  setExistingFileAsMaster,
  createMasterFileInSharepoint,
  getFileFromSharepoint,
  uploadUpdatedFileToSharepoint,
  uploadFileToSharepoint,
  getViewOnlineLink,
} from '@/services/sharepoint.service'
import path from 'path'
import { DateTime } from 'luxon'

// const s3 = new S3({
//   accessKeyId: AWS_ACCESS_KEY_ID,
//   secretAccessKey: AWS_SECRET_ACCESS_KEY,
// })

// TODO: Use the file middleware native export to s3

export type UploadedFileProps = {
  /** Name of the file on the uploader's computer. */
  originalname: string
  /**
   * Value of the `Content-Transfer-Encoding` header for this file.
   * @deprecated since July 2015
   * @see RFC 7578, Section 4.7
   */
  encoding: string
  /** Value of the `Content-Type` header for this file. */
  mimetype: string
  /** Size of the file in bytes. */
  size: number
}

export class Uploader {
  // static Upload = async (req: Request, res: any) => {
  //   const { customerXRefID } = req.params

  //   // TODO: Also store this file in db with entityID
  //   // Initialize bucket
  //   // await initBucket(s3, BUCKET_NAME)

  //   // get file data through req.file thank to multer
  //   console.log('file object', req.file)

  //   const uploadRes = await uploadToS3(s3, customerXRefID, req.file)

  //   const uploadedFile = {
  //     mimetype: req.file.mimetype,
  //     originalname: req.file.originalname,
  //     size: req.file.size,
  //     uploaded: uploadRes.data,
  //   }

  //   if (uploadRes.success) {
  //     res.status(200).json(uploadedFile)
  //   } else {
  //     res.status(400).json(uploadRes)
  //   }
  // }

  static uploadToSharepoint = async (req: Request, res: any) => {
    const { customerXRefID } = req.params
    const { category, label } = req.query as { label?: string; category?: string }
    // get file data through req.file thank to multer
    console.log('file object', req.file)

    const uploadRes = await uploadFileToSharepoint(customerXRefID, req.file, category, label)

    const uploadedFile = {
      mimetype: req.file.mimetype,
      originalname: req.file.originalname,
      size: req.file.size,
      uploaded: uploadRes.data,
    }

    if (uploadRes.success) {
      res.status(200).json(uploadedFile)
    } else {
      res.status(400).json(uploadRes)
    }
  }

  static chooseMasterFile = async (req: Request, res: any): Promise<void> => {
    const { customerXRefID, fileUUID } = req.params

    const fileAddress = await setExistingFileAsMaster({
      customerXRefID,
      fileUUID,
    })
    if (fileAddress) {
      res.status(200).json(fileAddress)
    } else {
      res.status(400)
    }
  }

  static createMasterFileInSharepoint = async (req: Request, res: any): Promise<void> => {
    const { customerXRefID } = req.params

    const response = await createMasterFileInSharepoint({
      customerXRefID,
    })
    if (response) {
      res.status(200).json(response)
    } else {
      res.status(400)
    }
  }

  static getFileFromSharepoint = async (req: Request, res: any): Promise<void> => {
    const { customerXRefID, fileUUID } = req.params

    const s3 = new S3({
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    })

    const fileAddress = await getFileFromSharepoint({
      s3,
      customerXRefID,
      bucketName: `supporting-packages`,
      fileUUID,
    })
    if (fileAddress) {
      res.status(200).json(fileAddress)
    } else {
      res.status(400)
    }
  }

  static updateContentsOfFile = async (req: Request, res: Response) => {
    const { customerXRefID, fileUUID } = req.params
    // get file data through req.file thank to multer
    console.log('file object', req.file)

    const files = await $FileService.validateAndGetFilesByIds({
      identifiers: {
        uuids: [fileUUID],
      },
    })
    const extension = path.extname(files.get(fileUUID).name)
    const fileName = `${fileUUID}${extension}`

    // TODO: Also store this file in db with entityID
    // Initialize bucket
    // await initBucket(s3, BUCKET_NAME)

    // await uploadUpdatedFileToS3(s3, customerXRefID, req.file, currentFile.uuid)

    // const fileName = `${fileUUID}.xlsx`
    // const params = { Bucket: `supporting-packages`, Key: `${customerXRefID}/${fileName}` }

    //  const content = await s3.getObject(params).promise()
    // const dir = __dirname + `/../../nextclerk-tmp`
    // if (!fs.existsSync(dir)) {
    //   fs.mkdirSync(dir)
    // }

    // fs.writeFileSync(`${dir}/${fileName}`, req.file.buffer)
    await uploadUpdatedFileToSharepoint({
      customerXRefID,
      fileName,
      file: req.file,
    })

    res.send(200)
  }

  static getFileOpenLinkFromSharepoint = async (req: Request, res: Response): Promise<void> => {
    const { customerXRefID, fileUUID } = req.params
    const file = await $FileService.validateAndGetFilesByIds({
      identifiers: {
        uuids: [fileUUID],
      },
    })
    const extension = path.extname(file.get(fileUUID).name)
    const uuidFileWithExtension = `${fileUUID}${extension}`
    const sharingLink = await getViewOnlineLink({
      customerXRefID,
      fileName: uuidFileWithExtension,
    })
    if (sharingLink) {
      // deepcode ignore XSS: <please specify a reason of ignoring this>
      res.send(sharingLink)
    } else {
      res.status(400)
    }
  }

  static getAllFiles = async (req: Request, res: Response): Promise<void> => {
    const { customerXRefID } = req.params as unknown as {
      customerXRefID: string
    }

    const { categories, labels, createdMonth, createdYear } = req.query as {
      labels?: string
      categories?: string
      createdMonth?: string
      createdYear?: string
    }
    let range: { start: DateTime; end: DateTime } | null = null
    if (createdMonth && createdYear) {
      const startDate = DateTime.fromObject({
        year: parseInt(createdYear),
        month: parseInt(createdMonth),
        day: 1,
      })
      range = {
        start: startDate,
        end: startDate.endOf('month'),
      }
    }

    const files = await $FileService.getFiles({
      entity: customerXRefID,
      labels: labels?.split(','),
      categories: categories?.split(','),
      range,
    })

    res.send(files)
  }

  static patchFile = async (req: Request, res: Response): Promise<void> => {
    const { customerXRefID, fileUUID } = req.params as unknown as {
      customerXRefID: string
      fileUUID: string
    }

    await $FileService.updateFileVisibility({
      fileUUID,
      isVisible: req.body.isVisible,
    })

    res.send('OK')
  }
}
