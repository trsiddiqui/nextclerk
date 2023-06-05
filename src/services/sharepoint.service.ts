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
import { File, FileRequest } from '@/types'

// TODO: Refactor this
// Use S3 service to get from S3 and then call uploadToSharepoint to store in sharepoint
export const setExistingFileAsMaster = async ({
  customerXRefID,
  fileUUID,
}: {
  customerXRefID: string
  fileUUID: string
}): Promise< { '@microsoft.graph.downloadUrl': string, sharingLink: string }> => {
  const entities = await $EntityService.validateAndGetEntities({
    identifiers: {
      uuids: [customerXRefID],
    },
  })

  await $FileService.validateAndGetFiles({
    identifiers: {
      uuids: [fileUUID],
    },
  })

  const fileName = `${fileUUID}.xlsx`

  const urlObject = await getMasterFileLinksFromSharepoint({
    customerFolderId: entities.get(customerXRefID).folderId,
    fileName,
  })
  return urlObject
}

export const getMasterFileLinksFromSharepoint = async({
  customerFolderId,
  fileName
}:{
  customerFolderId: string
  fileName: string
}): Promise< { '@microsoft.graph.downloadUrl': string, sharingLink: string }> => {
  let sharedFilePath
  try {
    const accessToken = await getAccessToken()
    // get folder id and file name
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

    if (!masterFile) {
      throw Error('File does not exist on sharepoint.')
    }
    const fileWebUrl = await axios.get(
      `https://graph.microsoft.com/v1.0/drives/${DRIVE_ID}/items/${masterFileId}?select=@microsoft.graph.downloadUrl`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    sharedFilePath = fileWebUrl.data
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
    sharedFilePath['sharingLink'] = sharingLinkResp.link.webUrl

  } catch (err) {
    console.error(
      err.response.status,
      err.response.data.error.code,
      err.response.data.error.message
    )
  }


  return sharedFilePath
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

  const urlObject = await uploadToSharepointAndGetLinks({
    dir,
    customerXRefID,
    fileName,
  })

  // TODO: majid delete temp file
  return urlObject
}

// TODO: Refactor this
// Use a service or handler to find template and call uploadToSharepoint to upload the template
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
  const urlObject = await uploadToSharepointAndGetLinks({
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

export const uploadToSharepointAndGetLinks = async ({
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

export const uploadUpdatedFileToSharepoint = async ({
  dir,
  customerXRefID,
  fileName,
  fileUUID,
}: {
  dir: string
  customerXRefID: string
  fileName: string
  fileUUID: string
}): Promise<{ '@microsoft.graph.downloadUrl': string; sharingLink: string }> => {
  let sharedFilePath

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

  await axios.put(
    `https://graph.microsoft.com/v1.0/drives/${DRIVE_ID}/items/${customerFolderId}:/${fileName}:/content`,
    fileBuffer,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )
  // sharedFilePath = sharingLinkResp.link.webUrl
  return sharedFilePath
}

export const uploadFileToSharepoint = async (
  customerXRefID: string,
  fileData?: Express.Multer.File
): Promise<{ success: boolean; message: string; data: object }> => {
  try {
    let customerFolderId : string
    const extension = path.extname(fileData!.originalname)
    const { originalname, mimetype } = fileData
    const uuid = v4()
    const uuidFileWithExtension = `${uuid}${extension}`

    const foundEntity = await $EntityService.validateAndGetEntities({
      identifiers: {
        uuids: [customerXRefID],
      },
    })

    const accessToken = await getAccessToken()

    if (!foundEntity.get(customerXRefID).folderId){
      customerFolderId = await createCustomerFolderInSharepoint({
        customerXRefID,
        accessToken
      })
      await $EntityService.upsertEntity({
        entity: {
          ...foundEntity.get(customerXRefID),
          folderId: customerFolderId
        }
      })
    } else {
      customerFolderId = foundEntity.get(customerXRefID).folderId
    }

    const uploadedFile = await uploadFileToSharepointWhenFolderExist({
      accessToken,
      customerFolderId,
      fileName: uuidFileWithExtension,
      fileBuffer: fileData.buffer
    })
    const uploadedFileObject : FileRequest= {
      uuid,
      entityID: foundEntity.get(customerXRefID).id,
      name: originalname,
      mimeType: mimetype,
      location: uploadedFile.sharingLink,
    }
    await $FileService.createFile({
      file: uploadedFileObject
     })

     return {
       success: true,
       message: 'File Uploaded Successfully',
       data: {
         ...uploadedFileObject,
         customerXRefID,
       },
     }
   } catch (error) {
     return { success: false, message: 'Unable to Upload the file', data: error }
   }
}

export const createCustomerFolderInSharepoint = async ({
  customerXRefID,
  accessToken
}:{
  customerXRefID: string
  accessToken: string
}): Promise<string> => {
    let customerFolderId
    try {
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

      customerFolderId = customerFolderCreated.data.id
    }
    console.log('customerFolderId', customerFolderId)
  } catch (err) {
    console.error(
      err.response.status,
      err.response.data.error.code,
      err.response.data.error.message
    )
  }
  return customerFolderId

}

export const uploadFileToSharepointWhenFolderExist = async ({
  customerFolderId,
  fileName,
  fileBuffer,
  accessToken
}: {
  customerFolderId: string
  fileName?: string
  fileBuffer: Buffer
  accessToken: string
}): Promise<{ '@microsoft.graph.downloadUrl': string; sharingLink: string }> => {
  let sharedFilePath
  console.log('MAJID', fileName)

  try {

    console.log('got token', accessToken)

    const uploadedFile = await axios.put(
      `https://graph.microsoft.com/v1.0/drives/${DRIVE_ID}/items/${customerFolderId}:/${fileName}:/content`,
      fileBuffer,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    const fileId = uploadedFile.data.id
    const fileWebUrl = await axios.get(
      `https://graph.microsoft.com/v1.0/drives/${DRIVE_ID}/items/${fileId}?select=@microsoft.graph.downloadUrl`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    sharedFilePath = fileWebUrl.data

    const sharingLinkResp = (
      await axios.post(
        `https://graph.microsoft.com/v1.0/Drives/${DRIVE_ID}/Items/${fileId}/createLink`,
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
    sharedFilePath['sharingLink'] = sharingLinkResp.link.webUrl
  } catch (err) {
    console.error(
      err.response.status,
      err.response.data.error.code,
      err.response.data.error.message
    )
  }
  return sharedFilePath
}
