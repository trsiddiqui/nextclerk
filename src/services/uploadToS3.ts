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
    // const fileContent = fs.readFileSync(fileData!.path);

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

export const getFromS3AndStoreInSharepoint = async ({
  s3,
  customerXRefID,
  bucketName,
  fileUUID,
}: {
  s3: S3
  customerXRefID: string
  bucketName: string
  fileUUID: string
}): Promise<any> => {
  const entity = await $EntityService.validateAndGetEntities({
    identifiers: {
      uuids: [customerXRefID],
    },
  })

  await $FileService.validateAndGetFiles({
    identifiers: {
      uuids: [fileUUID],
    },
  })
  const bucketStatus = await checkBucket(s3, bucketName)
  if (!bucketStatus.success) {
    throw Error(`Error in reading from bucket for Customer ${entity.get(customerXRefID).name}`)
  }

  const fileName = `${fileUUID}.xlsx`

  const filesInBucket = await s3
    .listObjectsV2({
      Bucket: bucketName,
    })
    .promise()

  console.log(filesInBucket)

  const params = { Bucket: bucketName, Key: `${customerXRefID}/${fileName}` }

  const content = await s3.getObject(params).promise()
  const dir = __dirname + `/../nextclerk-tmp`
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }

  fs.writeFile(`${dir}/${fileName}`, content.Body as NodeJS.ArrayBufferView, (err) => {
    if (err) {
      console.log(err)
      throw Error('error on creating temp file')
    }
  })

  const urlObject = await uploadToSharepoint({
    dir,
    customerXRefID,
    fileName,
  })
  return urlObject
}

export const getFileFromSharepoint = async ({
  s3,
  customerXRefID,
  bucketName,
  fileUUID,
}: {
  s3: S3
  customerXRefID: string
  bucketName: string
  fileUUID: string
}): Promise<any> => {
  const entity = await $EntityService.validateAndGetEntities({
    identifiers: {
      uuids: [customerXRefID],
    },
  })

  await $FileService.validateAndGetFiles({
    identifiers: {
      uuids: [fileUUID],
    },
  })

  // check file in sharepoint
  const fileUrl = await isFileExistInSharepoint({
    customerXRefID,
    fileUUID,
  })
  if (fileUrl) {
    return fileUrl
  }

  const bucketStatus = await checkBucket(s3, bucketName)
  if (!bucketStatus.success) {
    throw Error(`Error in reading from bucket for Customer ${entity.get(customerXRefID).name}`)
  }

  const fileName = `${fileUUID}.xlsx`

  const filesInBucket = await s3
    .listObjectsV2({
      Bucket: bucketName,
    })
    .promise()

  console.log(filesInBucket)

  const params = { Bucket: bucketName, Key: `${customerXRefID}/${fileName}` }

  const content = await s3.getObject(params).promise()
  const dir = __dirname + `/../nextclerk-tmp`
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }

  fs.writeFile(`${dir}/${fileName}`, content.Body as NodeJS.ArrayBufferView, (err) => {
    if (err) {
      console.log(err)
      throw Error('error on creating temp file')
    }
  })

  const urlObject = await uploadToSharepoint({
    dir,
    customerXRefID,
    fileName,
  })

  // TODO: majid delete temp file
  return urlObject
}

export const createMasterFileInSharepoint = async ({
  customerXRefID,
}: {
  customerXRefID: string
}) => {
  const fileName = 'LineItemsTemplate.xlsx'

  const entities = await $EntityService.validateAndGetEntities({
    identifiers: {
      uuids: [customerXRefID],
    },
  })

  const dir = __dirname + `/../../uploads`
  const fileUUID = v4()
  const urlObject = await uploadToSharepoint({
    dir,
    customerXRefID,
    fileName,
    fileUUID,
  })
  if (!urlObject) {
    throw Error('Error on creating master file in sharepoint')
  }

  const uploadedFile = {
    uuid: fileUUID,
    entityID: entities.get(customerXRefID).id,
    name: fileName,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    location: '',
  }
  // TODO: majid need to move this to service
  await $FilesManager.upsertFile({
    file: uploadedFile,
  })

  return {
    originalname: uploadedFile.name,
    sharingLink: urlObject.sharingLink,
    mimetype: uploadedFile.mimeType,
    downloadUrl: urlObject['@microsoft.graph.downloadUrl'],
    size: 16 * 1024,
    uploaded: {
      uuid: fileUUID,
    },
  }
}

export const uploadToSharepoint = async ({
  dir,
  customerXRefID,
  fileName,
  fileUUID,
}: {
  dir: string
  customerXRefID: string
  fileName: string
  fileUUID?: string
}): Promise<{ '@microsoft.graph.downloadUrl': string; sharingLink: string }> => {
  let sharedFilePath

  try {
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

    // TODO: Store customer folder ID so that we dont have to do these calls
    let customerFolderId
    if (customers.some((customer) => customer.name === customerXRefID)) {
      customerFolderId = customers.find((customer) => customer.name === customerXRefID).id
    } else {
      const customerFolderCreated = await axios.post(
        `https://graph.microsoft.com/v1.0/drives/${DRIVE_ID}/root:/Customers:/children`,
        {
          name: customerXRefID,
          folder: {},
          '@microsoft.graph.conflictBehavior': 'fail',
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      // console.log('customerFolderCreated', JSON.stringify(customerFolderCreated, null, 2))
      customerFolderId = customerFolderCreated.data.id
    }
    console.log('customerFolderId', customerFolderId)
    const fileBuffer = fs.readFileSync(`${dir}/${fileName}`)
    if (fileUUID) {
      fileName = `${fileUUID}.xlsx`
    }

    // check file exist

    const masterFile = await axios.put(
      `https://graph.microsoft.com/v1.0/drives/${DRIVE_ID}/items/${customerFolderId}:/${fileName}:/content`,
      fileBuffer,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    console.log(masterFile.data)
    const masterFileId = masterFile.data.id

    const masterFileWebUrl = await axios.get(
      `https://graph.microsoft.com/v1.0/drives/${DRIVE_ID}/items/${masterFileId}?select=@microsoft.graph.downloadUrl`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    sharedFilePath = masterFileWebUrl.data

    const sharingLinkResp = (
      await axios.post(
        `https://graph.microsoft.com/v1.0/Drives/${DRIVE_ID}/Items/${masterFileId}/createLink`,
        {
          type: 'edit',
          scope: 'anonymous',
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
    ).data

    const permissionId = (
      await axios.get(
        `https://graph.microsoft.com/v1.0/Drives/${DRIVE_ID}/Items/${masterFileId}/permissions`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
    ).data.value[0].id

    const x = await axios.delete(
      `https://graph.microsoft.com/v1.0/Drives/${DRIVE_ID}/Items/${masterFileId}/permissions/${permissionId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    sharedFilePath['sharingLink'] = sharingLinkResp.link.webUrl
    // sharedFilePath = sharingLinkResp.link.webUrl
  } catch (err) {
    console.error(
      err.response.status,
      err.response.data.error.code,
      err.response.data.error.message
    )
  }
  return sharedFilePath
}

export const isFileExistInSharepoint = async ({
  customerXRefID,
  fileUUID,
}: {
  customerXRefID: string
  fileUUID?: string
}) => {
  let sharedFilePath

  try {
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

    let customerFolderId
    if (customers.some((customer) => customer.name === customerXRefID)) {
      customerFolderId = customers.find((customer) => customer.name === customerXRefID).id
    } else {
      const customerFolderCreated = await axios.post(
        `https://graph.microsoft.com/v1.0/drives/${DRIVE_ID}/root:/Customers:/children`,
        {
          name: customerXRefID,
          folder: {},
          '@microsoft.graph.conflictBehavior': 'fail',
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      // console.log('customerFolderCreated', JSON.stringify(customerFolderCreated, null, 2))
      customerFolderId = customerFolderCreated.data.id
    }
    console.log('customerFolderId', customerFolderId)
    const fileName = `${fileUUID}.xlsx`

    // check file exist

    const masterFile = await axios.get(
      `https://graph.microsoft.com/v1.0/drives/${DRIVE_ID}/items/${customerFolderId}:/${fileName}?select=id`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    console.log(masterFile.data)
    const masterFileId = masterFile.data.id

    const masterFileWebUrl = await axios.get(
      `https://graph.microsoft.com/v1.0/drives/${DRIVE_ID}/items/${masterFileId}?select=@microsoft.graph.downloadUrl`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    sharedFilePath = masterFileWebUrl.data
  } catch (err) {
    console.error(
      err.response.status,
      err.response.data.error.code,
      err.response.data.error.message
    )
  }
  return sharedFilePath
}
