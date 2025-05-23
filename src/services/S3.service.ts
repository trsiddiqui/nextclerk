import { S3 } from 'aws-sdk'
import fs from 'fs'
import axios from 'axios'
import { v4 } from 'uuid'
import path from 'path'
import { BUCKET_NAME, DRIVE_ID } from '@/config'
import { $FilesManager } from '@/models'
import { $EntityService, $FileService } from './index'
import { checkBucket, initBucket } from '@/utils/s3/checkBucket'
import { getAccessToken } from '@/utils/util'
import { File } from '@/types'

/**
 * @name uploadToS3
 * @param {S3} s3
 * @param {File} fileData
 * @returns {Promise<{success:boolean; message: string; data: object;}>}
 */
export const uploadToS3 = async (
  s3: S3,
  customerXRefID: string,
  fileData?: Express.Multer.File
): Promise<{ success: boolean; message: string; data: object }> => {
  try {
    const extension = path.extname(fileData!.originalname)
    const { originalname, mimetype } = fileData
    const uuid = v4()
    const uuidFile = `${uuid}${extension}`

    const entity = await $EntityService.validateAndGetEntities({
      identifiers: {
        uuids: [customerXRefID],
      },
    })

    const params = {
      Bucket: BUCKET_NAME,
      Key: `${customerXRefID}/${uuidFile}`,
      Body: fileData.buffer,
    }

    try {
      const res = await s3.upload(params).promise()
      const uploadedFile = {
        uuid,
        entityID: entity.get(customerXRefID).id,
        name: originalname,
        mimeType: mimetype,
        location: res.Location,
      }
      // TODO: majid need to move this to service
      await $FilesManager.upsertFile({
        file: uploadedFile,
      })

      delete uploadedFile.entityID

      console.log('File Uploaded with Successful', res.Location)

      return {
        success: true,
        message: 'File Uploaded with Successful',
        data: {
          ...uploadedFile,
          customerXRefID,
        },
      }
    } catch (error) {
      return { success: false, message: 'Unable to Upload the file', data: error }
    }
  } catch (error) {
    return { success: false, message: 'Unable to access this file', data: {} }
  }
}

export const uploadUpdatedFileToS3 = async (
  s3: S3,
  customerXRefID: string,
  fileData: Express.Multer.File,
  fileUuid: string
): Promise<{ success: boolean; message: string; data: object }> => {
  try {
    const extension = path.extname(fileData!.originalname)
    const { originalname, mimetype } = fileData
    const uuidFile = `${fileUuid}${extension}`

    const entity = await $EntityService.validateAndGetEntities({
      identifiers: {
        uuids: [customerXRefID],
      },
    })

    const params = {
      Bucket: BUCKET_NAME,
      Key: `${customerXRefID}/${uuidFile}`,
      Body: fileData.buffer,
    }

    try {
      const res = await s3.upload(params).promise()
      const uploadedFile = {
        uuid: fileUuid,
        entityID: entity.get(customerXRefID).id,
        name: originalname,
        mimeType: mimetype,
        location: res.Location,
      }
      // TODO: majid need to move this to service
      await $FilesManager.upsertFile({
        file: uploadedFile,
      })

      delete uploadedFile.entityID

      console.log('File Uploaded with Successful', res.Location)

      return {
        success: true,
        message: 'File Uploaded with Successful',
        data: {
          ...uploadedFile,
          customerXRefID,
        },
      }
    } catch (error) {
      return { success: false, message: 'Unable to Upload the file', data: error }
    }
  } catch (error) {
    return { success: false, message: 'Unable to access this file', data: {} }
  }
}
