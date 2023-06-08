import Excel from 'exceljs'
import XLSX from 'xlsx'
import { hash } from 'bcrypt'
import { v4 } from 'uuid'
import {
  SupportingPackage,
  SupportingPackageRequest,
  SupportingPackageResponse,
} from '../types/supportingPackage'
import { HttpException } from '../exceptions/HttpException'
import { SupportingPackagesManager, SupportingPackagesUsersManager } from '../models'
import CategoryService from '../services/categories.service'
import LabelService from '../services/labels.service'
import EntityService from './entities.service'
import UserService from './user.service'
import { getAccessToken, isEmpty } from '../utils/util'
import axios from 'axios'
import { DRIVE_ID } from '../config'
import knex, { Knex } from 'knex'
import {
  Category,
  Label,
  SupportingPackageCommunicationRequest,
  SupportingPackageCommunicationResponse,
} from '@/types'
import SupportingPackageUserService from './supportingPackagesUsers.service'
import SupportingPackageAttachmentService from './supportingPackagesAttachments.service'
import FileService from './files.service'
import SupportingPackageCommunicationService from './supportingPackagesCommunications.service'
import { getDownloadLink, getMasterFileLinksFromSharepoint } from './sharepoint.service'

export default class SupportingPackageService {
  #supportingPackagesManager: SupportingPackagesManager

  #categoryService: CategoryService

  #labelService: LabelService

  #entityService: EntityService

  #userService: UserService

  #fileService: FileService

  #supportingPackagesUsersService: SupportingPackageUserService

  #supportingPackageAttachmentService: SupportingPackageAttachmentService

  #supportingPackageCommunicationService: SupportingPackageCommunicationService

  constructor({
    supportingPackagesManager,
    categoryService,
    labelService,
    entityService,
    userService,
    fileService,
    supportingPackagesUsersService,
    supportingPackageAttachmentService,
    supportingPackageCommunicationService,
  }: {
    supportingPackagesManager: SupportingPackagesManager
    categoryService: CategoryService
    labelService: LabelService
    entityService: EntityService
    userService: UserService
    fileService: FileService
    supportingPackagesUsersService: SupportingPackageUserService
    supportingPackageAttachmentService: SupportingPackageAttachmentService
    supportingPackageCommunicationService: SupportingPackageCommunicationService
  }) {
    this.#supportingPackagesManager = supportingPackagesManager
    this.#categoryService = categoryService
    this.#labelService = labelService
    this.#entityService = entityService
    this.#userService = userService
    this.#fileService = fileService
    this.#supportingPackagesUsersService = supportingPackagesUsersService
    this.#supportingPackageAttachmentService = supportingPackageAttachmentService
    this.#supportingPackageCommunicationService = supportingPackageCommunicationService
  }

  public async validateAndGetSupportingPackages({
    identifiers,
  }: {
    identifiers: { uuids: string[] } | { ids: string[] }
  }): Promise<Map<string, SupportingPackage>> {
    const returnedSupportingPackages =
      await this.#supportingPackagesManager.getSupportingByIdentifiers({
        identifiers,
      })

    const inputLength = 'uuids' in identifiers ? identifiers.uuids.length : identifiers.ids.length

    if (returnedSupportingPackages.length !== inputLength) {
      throw new Error('One or more of the reference Supporting packages could not be found')
    }
    return new Map(returnedSupportingPackages.map((obj) => [obj.uuid, obj]))
  }

  public async createLineItemsSheet(customerXRefID: string): Promise<string> {
    let sharedFilePath = ''
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

      // Copy line item template file for new customer
      // https://learn.microsoft.com/en-us/graph/api/driveitem-copy?view=graph-rest-1.0&tabs=http https://learn.microsoft.com/en-us/graph/api/driveitem-copy?view=graph-rest-1.0&tabs=http
      const lineItemFileCreated = await axios.post(
        `https://graph.microsoft.com/v1.0/Drives/${DRIVE_ID}/Items/1E15F199-0BE0-4AAC-B94A-D007364CB3E2/copy?@microsoft.graph.conflictBehavior=replace`,
        {
          name: 'LineItems.xlsx',
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
      const file = files.find((x) => x.name === 'LineItems.xlsx')
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

  // http://localhost:3000/customerXRefID/supporting-packages/123/lineItems/sheet
  public async getLineItemsSheetContent(
    customerXRefID: string,
    supportingPackageXRefID: string
  ): Promise<unknown> {
    // TODO: Validate supporting package
    const accessToken = await getAccessToken()

    console.log('got token', accessToken) // Check if customer folder exists
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
    if (!customers.some((customer) => customer.name === customerXRefID)) {
      return {}
    }

    // customerFolderId = customers.find((customer) => customer.name === customerXRefID).id

    // Get line items file
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
    const file = files.find((x) => x.name === 'LineItems.xlsx')
    // id: 01JODUYB7G3MSGVZCY4JCKB2JLP7HCZHQF
    console.log('created file', JSON.stringify(file, null, 2))

    const content = await axios.get(
      `https://graph.microsoft.com/v1.0/drives/${DRIVE_ID}/items/${file.id}/content`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        responseType: 'arraybuffer',
      }
    )
    return content.data
    // // load from buffer
    // const workbook = new Excel.Workbook()
    // await workbook.xlsx.load(content.data)

    // return workbook.worksheets.map((worksheet) => ({
    //   name: worksheet.name,
    //   columns: worksheet.columns.map((column) => ({
    //     address: column.letter,
    //     hidden: column.hidden,
    //     width: column.width,
    //   })),
    //   rows: worksheet.getRows(1, worksheet.rowCount).map((row) => row.model),
    //   // return theme
    // }))
  }

  // public async findAllSupportingPackage(): Promise<SupportingPackage[]> {
  //   const users: SupportingPackage[] = await SupportingPackages.query().select().from('users')
  //   return users
  // }
  // public async findSupportingPackageById(userId: number): Promise<SupportingPackage> {
  //   const findSupportingPackage: SupportingPackage = await SupportingPackages.query().findById(userId)
  //   if (!findSupportingPackage) throw new HttpException(409, "SupportingPackage doesn't exist")
  //   return findSupportingPackage
  // }

  public async createSupportingPackage({
    customerXRefID,
    supportingPackageRequest,
    userXRefID,
  }: {
    customerXRefID: string
    supportingPackageRequest: SupportingPackageRequest
    userXRefID: string
  }): Promise<SupportingPackageResponse> {
    await this.#entityService.validateAndGetEntities({
      identifiers: { uuids: [customerXRefID] },
    })
    if (isEmpty(userXRefID)) throw new HttpException(400, 'user is empty')
    const {
      categoryUUID,
      labelUUID,
      title,
      number,
      isConfidential,
      journalNumber,
      isDraft,
      date,
      users,
      files,
      communications,
    } = supportingPackageRequest

    const [label, category, usersRequest, attachment] = await Promise.all([
      this.#labelService.validateAndGetLabels({
        identifiers: {
          uuids: [labelUUID],
        },
      }),
      this.#categoryService.validateAndGetCategories({
        identifiers: {
          uuids: [categoryUUID],
        },
      }),
      this.#userService.validateAndGetUsers({
        identifiers: {
          uuids: [...new Set(users.map((u) => u.uuid))],
        },
      }),
      this.#fileService.validateAndGetFiles({
        identifiers: {
          uuids: [...new Set(files.map((f) => f.uuid))],
        },
      }),
    ])

    const uuid = v4()
    const sp = {
      title,
      number,
      entityID: 1,
      categoryID: category.get(categoryUUID)?.id,
      labelID: label.get(labelUUID)?.id,
      isConfidential,
      journalNumber,
      isDraft,
      date,
      uuid,
    }

    const createdSP = await this.#supportingPackagesManager.createSupportingPackage({
      supportingPackage: sp,
      userXRefID,
    })

    // add sp users
    await this.#supportingPackagesUsersService.insertSupportingPackageAndUserRelationships({
      relationships: users.map((user) => ({
        supportingPackageID: createdSP.id.toString(),
        userID: usersRequest.get(user.uuid).id,
        type: user.type,
      })),
      userXRefID,
    })

    // add supporting package files
    await this.#supportingPackageAttachmentService.insertSupportingPackageAndAttachmentRelationships(
      {
        relationships: files.map((file) => ({
          supportingPackageID: createdSP.id,
          fileID: attachment.get(file.uuid).id,
          name: attachment.get(file.uuid).name,
          mimeType: attachment.get(file.uuid).mimeType,
          isMaster: file.isMaster ?? false,
          highLights: file.highLights ?? null,
          size: attachment.get(file.uuid).size,
        })),
        userXRefID,
      }
    )

    await this.#supportingPackageCommunicationService.insertSupportingPackageAndCommunicationsRelationships(
      {
        relationships: communications.map((communication) => ({
          text: communication.text,
          cellLink: communication.cellLink,
          isCellLinkValid: communication.isCellLinkValid,
          replyToCommunicationUUID: communication.replyToCommunicationUUID,
          isChangeRequest: communication.isChangeRequest,
          supportingPackageID: createdSP.id,
          attachments: communication.attachments,
          users: communication.users,
        })),
        supportingPackageId: createdSP.id,
        userXRefID,
      }
    )

    return this.getSupportingPackage({
      customerXRefID,
      supportingPackageUUID: createdSP.uuid,
    })
  }

  public async createSupportingPackageCommunication({
    customerXRefID,
    supportingPackageUUID,
    communication,
    userXRefID,
  }: {
    customerXRefID: string
    supportingPackageUUID: string
    communication: SupportingPackageCommunicationRequest
    userXRefID: string
  }): Promise<SupportingPackageCommunicationResponse> {
    await this.#entityService.validateAndGetEntities({
      identifiers: { uuids: [customerXRefID] },
    })
    if (isEmpty(userXRefID)) throw new HttpException(400, 'user is empty')
    const {
      text,
      cellLink,
      isCellLinkValid,
      replyToCommunicationUUID,
      isChangeRequest,
      attachments,
      users,
      status,
    } = communication

    const [supportingPackage] = await Promise.all([
      this.validateAndGetSupportingPackages({
        identifiers: {
          uuids: [supportingPackageUUID],
        },
      }),
    ])

    const createdCommunication =
      await this.#supportingPackageCommunicationService.insertSupportingPackageAndCommunicationsRelationships(
        {
          relationships: [
            {
              text,
              cellLink,
              isCellLinkValid,
              replyToCommunicationUUID: replyToCommunicationUUID ?? null,
              isChangeRequest,
              attachments,
              users,
              status,
            },
          ],
          supportingPackageId: supportingPackage.get(supportingPackageUUID).id,
          userXRefID,
        }
      )

    return createdCommunication[0]
  }

  public async updateSupportingPackage({
    customerXRefID,
    supportingPackageUUID,
    supportingPackageRequest,
    userXRefID,
  }: {
    customerXRefID: string
    supportingPackageUUID: string
    supportingPackageRequest: Partial<SupportingPackageRequest>
    userXRefID: string
  }): Promise<SupportingPackageResponse> {
    const {
      categoryUUID,
      labelUUID,
      title,
      number,
      isConfidential,
      journalNumber,
      isDraft,
      date,
      users,
      files,
    } = supportingPackageRequest

    const [label, category, mapUser] = await Promise.all([
      this.#labelService.validateAndGetLabels({
        identifiers: {
          uuids: [labelUUID],
        },
      }),
      this.#categoryService.validateAndGetCategories({
        identifiers: {
          uuids: [categoryUUID],
        },
      }),
      this.#userService.validateAndGetUsers({
        identifiers: {
          uuids: [...new Set(users.map((u) => u.uuid))],
        },
      }),
    ])

    const entity = await this.#entityService.validateAndGetEntities({
      identifiers: { uuids: [customerXRefID] },
    })

    if (isEmpty(userXRefID)) throw new HttpException(400, 'user is empty')

    const coreSupportingPackage = await this.#supportingPackagesManager.getSupportingPackagesByUUID(
      {
        uuid: supportingPackageUUID,
      }
    )

    const existingSupportingPackage = await this.getSupportingPackage({
      customerXRefID,
      supportingPackageUUID,
    })

    if (
      existingSupportingPackage.title !== title ||
      existingSupportingPackage.number !== number ||
      existingSupportingPackage.date !== date ||
      existingSupportingPackage.categoryUUID !== categoryUUID ||
      existingSupportingPackage.labelUUID !== labelUUID ||
      existingSupportingPackage.isConfidential !== isConfidential ||
      existingSupportingPackage.journalNumber !== journalNumber ||
      existingSupportingPackage.isDraft !== isDraft
    ) {
      await this.#supportingPackagesManager.updateSupportingPackage({
        entityID: String(entity.get(customerXRefID).id),
        supportingPackage: {
          title,
          number,
          isConfidential,
          journalNumber,
          isDraft,
          date,
          categoryID: category.get(categoryUUID).id,
          labelID: label.get(labelUUID).id,
        },
        userXRefID,
        identifier: { supportingPackageUUID },
      })
    }

    await this.#supportingPackagesUsersService.upsertSupportingPackageAndUserRelationship({
      supportingPackageId: coreSupportingPackage.id.toString(),
      users,
      userXRefID,
    })

    await this.#supportingPackageAttachmentService.upsertSupportingPackageAndAttachmentRelationships(
      {
        supportingPackageId: coreSupportingPackage.id.toString(),
        attachments: files,
        userXRefID,
      }
    )

    return this.getSupportingPackage({
      customerXRefID,
      supportingPackageUUID,
    })
  }

  public async getSupportingPackage({
    customerXRefID,
    supportingPackageUUID,
  }: {
    customerXRefID: string
    supportingPackageUUID: string
  }): Promise<SupportingPackageResponse> {
    const entity = await this.#entityService.validateAndGetEntities({
      identifiers: { uuids: [customerXRefID] },
    })

    const supportingPackage = await this.#supportingPackagesManager.getSupportingPackagesByUUID({
      uuid: supportingPackageUUID,
    })

    if (!supportingPackage) {
      throw new Error('supporting package could not be found')
    }

    const {
      id,
      uuid,
      number,
      title,
      isConfidential,
      date,
      isDraft,
      journalNumber,
      createdAt,
      createdBy,
      updatedAt,
      updatedBy,
    } = supportingPackage

    const [supportingPackageLabel, supportingPackageCategory] = await Promise.all([
      this.#labelService.validateAndGetLabels({
        identifiers: {
          ids: [supportingPackage.labelID.toString()],
        },
      }),
      this.#categoryService.validateAndGetCategories({
        identifiers: {
          ids: [String(supportingPackage.categoryID)],
        },
      }),
    ])
    const label = supportingPackageLabel.entries().next().value
    const labelName = supportingPackageLabel.get(label[0]).label
    const category = supportingPackageCategory.entries().next().value
    const categoryName = supportingPackageCategory.get(category[0]).name

    const users =
      await this.#supportingPackagesUsersService.getSupportingPackagesUsersBySupportingPackageIds({
        ids: [id.toString()],
      })

    const files =
      await this.#supportingPackageAttachmentService.getSupportingPackagesAttachmentsBySupportingPackageId(
        {
          id: id.toString(),
        }
      )

    const communications =
      await this.#supportingPackageCommunicationService.getSupportingPackageCommunicationsBySupportingPackageId(
        {
          id,
        }
      )

    const masterFile = files.find((file) => file.isMaster)
    if (masterFile) {
      const downloadLink = await getMasterFileLinksFromSharepoint({
        customerFolderId: entity.get(customerXRefID).folderId,
        fileName: `${masterFile.uuid}.xlsx`,
      })
      masterFile.downloadUrl = downloadLink['@microsoft.graph.downloadUrl']
    }

    return {
      uuid,
      number,
      title,
      entityUUID: entity.get(customerXRefID).uuid,
      entityName: entity.get(customerXRefID).name,
      categoryUUID: category[0],
      categoryName,
      labelUUID: label[0],
      label: labelName,
      isConfidential,
      journalNumber,
      isDraft,
      date,
      users: users[id],
      files,
      createdAt,
      createdBy,
      updatedAt,
      updatedBy,
      communications,
    }
  }

  // public async updateSupportingPackage(userId: number, userData: SupportingPackage): Promise<SupportingPackage> {
  //   if (isEmpty(userData)) throw new HttpException(400, 'userData is empty')
  //   const findSupportingPackage: SupportingPackage[] = await SupportingPackages.query().select().from('users').where('id', '=', userId)
  //   if (!findSupportingPackage) throw new HttpException(409, "SupportingPackage doesn't exist")
  //   const hashedPassword = await hash(userData.password, 10)
  //   await SupportingPackages.query()
  //     .update({ ...userData, password: hashedPassword })
  //     .where('id', '=', userId)
  //     .into('users')
  //   const updateSupportingPackageData: SupportingPackage = await SupportingPackages.query()
  //     .select()
  //     .from('users')
  //     .where('id', '=', userId)
  //     .first()
  //   return updateSupportingPackageData
  // }
  // public async deleteSupportingPackage(userId: number): Promise<SupportingPackage> {
  //   const findSupportingPackage: SupportingPackage = await SupportingPackages.query()
  //     .select()
  //     .from('users')
  //     .where('id', '=', userId)
  //     .first()
  //   if (!findSupportingPackage) throw new HttpException(409, "SupportingPackage doesn't exist")
  //   await SupportingPackages.query().delete().where('id', '=', userId).into('users')
  //   return findSupportingPackage
  // }
}
