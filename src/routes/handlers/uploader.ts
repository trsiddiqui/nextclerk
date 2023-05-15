import { S3 } from 'aws-sdk'
import { Request } from 'express'
import { initBucket } from '../../utils/s3/checkBucket'

import { uploadToS3 } from '../../services/uploadToS3'
import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, BUCKET_NAME } from '@/config'

// TODO: Use the file middleware native export to s3

export class Uploader {
  static Upload = async (req: Request, res: any) => {
    const s3 = new S3({
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    })

    // Initialize bucket
    await initBucket(s3, BUCKET_NAME)

    // get file data through req.file thank to multer
    console.log('file object', req.file)

    const uploadRes = await uploadToS3(s3, req.file)

    if (uploadRes.success) {
      res.status(200).json(uploadRes)
    } else {
      res.status(400).json(uploadRes)
    }
  }
}
