import { S3 } from 'aws-sdk'
import fs from 'fs'
import axios from 'axios'
import { v4 } from 'uuid'
import path from 'path'
import { BUCKET_NAME, DRIVE_ID } from '@/config'
import { $FilesManager } from '@/models'
import { $EntityService } from './index'
import { checkBucket, initBucket } from '@/utils/s3/checkBucket'
import { getAccessToken } from '@/utils/util'

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
        uuids: [customerXRefID]
      }
    })

    const params = {
      Bucket: BUCKET_NAME,
      Key: uuidFile,
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
      await $FilesManager.upsertFile({
        file: uploadedFile,
      })

      delete uploadedFile.entityID

      console.log('File Uploaded with Successful', res.Location)

      return { success: true, message: 'File Uploaded with Successful', data: {
        ...uploadedFile,
        customerXRefID
      } }
    } catch (error) {
      return { success: false, message: 'Unable to Upload the file', data: error }
    }
  } catch (error) {
    return { success: false, message: 'Unable to access this file', data: {} }
  }
}


export const getFromS3 = async ({
  s3,
  customerXRefID,
  bucketName,
  fileUUID,
}: {
  s3: S3
  customerXRefID: string
  bucketName: string
  fileUUID: string
}) => {

  const entity = await $EntityService.validateAndGetEntities({
    identifiers: {
      uuids: [customerXRefID]
    }
  })
  const bucketStatus = await checkBucket(s3, bucketName)
  if (!bucketStatus.success) {
    throw Error(`Error in reading from bucket for Customer ${entity.get(customerXRefID).name}`)
  }

  const fileName = `${fileUUID}.xlsx`

  const filesInBucket = await s3.listObjectsV2({
    Bucket: bucketName
  }).promise()

  console.log(filesInBucket)

  const params = { Bucket: bucketName, Key: `${customerXRefID}/${fileName}`}

  const content =  await s3.getObject(params).promise()
  const dir = __dirname +`/../nextclerk-tmp`
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir)
}


  fs.writeFile(`${dir}/${fileName}`, content.Body, (err) => {
    if (err) {
      console.log(err)
      throw Error('error on creating temp file')
    }
  })

  const rs =  s3.getObject(params).createReadStream()
  await uploadToOneDrive({
    dir,
    customerXRefID,
    fileName
  })
  // return content
  // const response = await s3.getObject(params).promise()
  // return response.Body

}

export const uploadToOneDrive = async ({
  dir,
  customerXRefID,
  fileName
}:{
  dir: string
  customerXRefID: string
  fileName: string
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

    // check file exist
    const masterFiles = (
      await axios.get(
        `https://graph.microsoft.com/v1.0/drives/${DRIVE_ID}/root:/Customers/${customerXRefID}:/children`,
        {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
    ).data.value

    if (!masterFiles.some((file) => file.name === fileName)) {
      const createdFile =( await axios.put(
        `https://graph.microsoft.com/v1.0/drives/${DRIVE_ID}/items/${customerFolderId}:/${fileName}:/content`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,

          },

        }
      ), {

      })
    }

    // Copy line item template file for new customer
    // https://learn.microsoft.com/en-us/graph/api/driveitem-copy?view=graph-rest-1.0&tabs=http https://learn.microsoft.com/en-us/graph/api/driveitem-copy?view=graph-rest-1.0&tabs=http
    const lineItemFileCreated = await axios.post(
      `https://graph.microsoft.com/v1.0/Drives/${DRIVE_ID}/Items/1E15F199-0BE0-4AAC-B94A-D007364CB3E2/copy?@microsoft.graph.conflictBehavior=replace`,
      {
        name: fileName,
        parentReference: {
          driveId: DRIVE_ID,
          id: customerFolderId,
        },
        '@microsoft.graph.conflictBehavior': 'replace',
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    console.log('lineItemFileCreated', 'success')

    // Get file created info
    const files = (
      await axios.get(
        `https://graph.microsoft.com/v1.0/drives/${DRIVE_ID}/root:/Customers/${customerXRefID}:/children`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
    ).data.value
    console.log('customers', JSON.stringify(files, null, 2))
    const file = files.find((x) => x.name === fileName)
    console.log('created file', JSON.stringify(file, null, 2))

    // // CREATE SHARING LINK
    // https://learn.microsoft.com/en-us/graph/api/listitem-createlink?view=graph-rest-beta&tabs=http
    const sharingLinkResp = (
      await axios.post(
        `https://graph.microsoft.com/v1.0/Drives/${DRIVE_ID}/Items/${file.id}/createLink`,
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
    console.log('sharing link', JSON.stringify(sharingLinkResp, null, 2))
    sharedFilePath = sharingLinkResp.link.webUrl
  } catch (err) {
    console.error(
      err.response.status,
      err.response.data.error.code,
      err.response.data.error.message
    )
  }
  return sharedFilePath
}

//  export const uploadToSharepoint = async({
//   dir,
//   fileName
//  }:{
//   dir:string
//   fileName: string
//  }) => {
//   const stats = fs.statSync( dir )
//   const totalSize = stats.size
//   const readStream = fs.createReadStream( dir )
//   const fileObject = FileUpload. .StreamUpload( readStream, fileName, totalSize )

//  }
