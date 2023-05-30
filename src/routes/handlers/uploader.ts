import { S3 } from 'aws-sdk'
import fs from 'fs'
import { Request } from 'express'
import { initBucket } from '../../utils/s3/checkBucket'

import { getFromS3, uploadToS3 } from '../../services/uploadToS3'
import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, BUCKET_NAME, DRIVE_ID } from '@/config'
import { getAccessToken } from '@/utils/util'
import axios from 'axios'

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
  static Upload = async (req: Request, res: any) => {
    const { customerXRefID } = req.params
    const s3 = new S3({
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    })

    // TODO: Also store this file in db with entityID
    // Initialize bucket
    // await initBucket(s3, BUCKET_NAME)

    // get file data through req.file thank to multer
    console.log('file object', req.file)

    const uploadRes = await uploadToS3(s3, customerXRefID, req.file)

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

  static copyFileToOneDrive = async (req: Request, res: any): Promise<void> => {
    const { customerXRefID, fileUUID } = req.params

    const s3 = new S3({
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    })

    await getFromS3({
      s3,
      customerXRefID,
      bucketName: `supporting-packages`,
      fileUUID,
    })
  }

  // TODO: DELETE BELOW \/\/\/\/\/

  static testing = async (req: Request, res: any): Promise<void> => {
    const accessToken = await getAccessToken()

    console.log('got token', accessToken)

    // Check if customer folder exists
    const customers = (
      await axios.get(
        `https://graph.microsoft.com/v1.0/drives/${DRIVE_ID}/root:/Customers:/children`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
    ).data.value

    console.log('customers', JSON.stringify(customers, null, 2))

    const customerFolderId = customers.find((customer) => customer.name === 'CustomerXRefID').id

    const fileBuffer = fs.readFileSync('/Users/tsiddiqui/Downloads/testing.xlsx')

    await axios.put(
      `https://graph.microsoft.com/v1.0/drives/${DRIVE_ID}/items/${customerFolderId}:/LineItemFile.xlsx:/content`,
      fileBuffer,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
  }
  // TODO: DELETE ABOVE /\/\/\/\/\
}
