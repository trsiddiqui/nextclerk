import { v4 } from 'uuid'
import {
  SupportingPackage,
  SupportingPackageRequest,
  SupportingPackageResponse,
} from '../types/supportingPackage'
import { HttpException } from '../exceptions/HttpException'
import { SupportingPackagesManager } from '../models'
import CategoryService from '../services/categories.service'
import LabelService from '../services/labels.service'
import EntityService from './entities.service'
import UserService from './user.service'
import { getAccessToken, isEmpty } from '../utils/util'
import axios from 'axios'
import { DRIVE_ID } from '../config'
import {
  JournalEntryRequest,
  QBJournalEntryLine,
  QBJournalEntryLines,
  SupportingPackageCommunicationRequest,
  SupportingPackageCommunicationResponse,
} from '@/types'
import SupportingPackageUserService from './supportingPackagesUsers.service'
import SupportingPackageAttachmentService from './supportingPackagesAttachments.service'
import FileService from './files.service'
import SupportingPackageCommunicationService from './supportingPackagesCommunications.service'
import { getMasterFileLinksFromSharepoint } from './sharepoint.service'
import SupportingPackageJournalEntriesService from './supportingPackagesJournalEntries.service'
import { redis } from '@/server'
import AccountService from './accounts.service'
import IntegrationService from './integrations.service'



export default class SupportingPackageService {
  #supportingPackagesManager: SupportingPackagesManager

  #categoryService: CategoryService

  #labelService: LabelService

  #entityService: EntityService

  #userService: UserService

  #fileService: FileService

  #accountService: AccountService

  #supportingPackagesUsersService: SupportingPackageUserService

  #supportingPackageAttachmentService: SupportingPackageAttachmentService

  #supportingPackageCommunicationService: SupportingPackageCommunicationService

  #supportingPackageJournalEntriesService: SupportingPackageJournalEntriesService

  #integrationService: IntegrationService

  constructor({
    supportingPackagesManager,
    categoryService,
    labelService,
    entityService,
    userService,
    fileService,
    accountService,
    supportingPackagesUsersService,
    supportingPackageAttachmentService,
    supportingPackageCommunicationService,
    supportingPackageJournalEntriesService,
    integrationService
  }: {
    supportingPackagesManager: SupportingPackagesManager
    categoryService: CategoryService
    labelService: LabelService
    entityService: EntityService
    userService: UserService
    fileService: FileService
    accountService: AccountService
    supportingPackagesUsersService: SupportingPackageUserService
    supportingPackageAttachmentService: SupportingPackageAttachmentService
    supportingPackageCommunicationService: SupportingPackageCommunicationService
    supportingPackageJournalEntriesService: SupportingPackageJournalEntriesService
    integrationService: IntegrationService
  }) {
    this.#supportingPackagesManager = supportingPackagesManager
    this.#categoryService = categoryService
    this.#labelService = labelService
    this.#entityService = entityService
    this.#userService = userService
    this.#fileService = fileService
    this.#accountService = accountService
    this.#supportingPackagesUsersService = supportingPackagesUsersService
    this.#supportingPackageAttachmentService = supportingPackageAttachmentService
    this.#supportingPackageCommunicationService = supportingPackageCommunicationService
    this.#supportingPackageJournalEntriesService = supportingPackageJournalEntriesService
    this.#integrationService = integrationService
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
      journalEntries,
      taskID,
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
      taskID,
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

    if (journalEntries?.length > 0) {
      await this.#supportingPackageJournalEntriesService.insertSupportingPackageJournalEntries({
          journalEntries,
          supportingPackageId: createdSP.id,
          userXRefID,
        }
      )
    }

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
      communications,
      journalEntries,
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
    if (journalEntries?.length) {
      await this.#supportingPackageJournalEntriesService.upsertSupportingPackageJournalEntries({
        journalEntries ,
        supportingPackageId: coreSupportingPackage.id,
        userXRefID
      })
    }

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

    const journalEntries =
      await this.#supportingPackageJournalEntriesService.getJournalEntryBySupportingPackageId(
        {
          supportingPackageId: id,
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
      journalEntries,
    }
  }

  private async parseJEtoQBJEData({
    journalEntryLines,
    supportingPackageTitle
  }: {
    journalEntryLines: JournalEntryRequest[]
    supportingPackageTitle: string

  }) : Promise<QBJournalEntryLines> {
    const parsedJournals: QBJournalEntryLine [] = []
    for(const je of journalEntryLines) {
      const account = await this.#accountService.validateAndGetAccounts({
        identifiers: {
          uuids: [je.accountUUID]
        }
      })
      const parsedJE : QBJournalEntryLine = {
        JournalEntryLineDetail: {
          PostingType: je.debitAmount ? 'Debit' : 'Credit',
          AccountRef: {
            name: account.get(je.accountUUID).label,
            value: account.get(je.accountUUID).internalID.toString()
          }
        },
        Amount: je.debitAmount ?? je.creditAmount,
        Description: je.memo,
        DetailType: "JournalEntryLineDetail"
      }
      parsedJournals.push(parsedJE)
    }
    const result = {
      Line:parsedJournals
    }
    return result
  }

  public async postToERP({
    journalEntryLines,
    customerXRefID,
    supportingPackageUUID,
    userXRefID
  }:{
    journalEntryLines: JournalEntryRequest[]
    customerXRefID: string
    supportingPackageUUID: string
    userXRefID: string
  }): Promise<unknown> {

    if (isEmpty(userXRefID)) throw new HttpException(400, 'user is empty')

    const coreSupportingPackage = await this.#supportingPackagesManager.getSupportingPackagesByUUID(
      {
        uuid: supportingPackageUUID,
      }
    )
    const { token, realmId } = await this.#integrationService.getQBToken({ customerXRefID })

    const axiosConfig = {
      headers: {
        "content-type": "application/json",
        "Authorization": `Bearer ${token}`,
      }
    }

    const data = await this.parseJEtoQBJEData({
      journalEntryLines,
      supportingPackageTitle: coreSupportingPackage.title
    })
    let postedJE

    try {
      postedJE = await axios.post(
        `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/journalentry?minorversion=65`,
        data,
        axiosConfig
      )

      console.log(postedJE.data.JournalEntry.Id)

    } catch (err) {
      console.error(
        err.response.status,
        err.response.data.error.code,
        err.response.data.error.message
      )
    }


    return postedJE
  }

  // public async getJournalEntryBySupportingPackageId({
  //   supportingPackageUUID,
  // }: {
  //   supportingPackageUUID: string,
  // }) : Promise<JournalEntryResponse[]> {
  //   const supportingPackage = await this.validateAndGetSupportingPackages({
  //     identifiers: {
  //       uuids: [supportingPackageUUID]
  //     }
  //   })
  //   const supportingPackageId = supportingPackage.get(supportingPackageUUID).id

  //   const journalEntryLines = await this.#journalEntriesManager.getAllJournalEntryLinesBySupportingPackageIDs({
  //     ids: [supportingPackageId.toString()]
  //   })
  //   return journalEntryLines
  // }

  // public async createSupportingPackageJournalEntries({
  //   customerXRefID,
  //   supportingPackageUUID,
  //   journalEntryLines,
  //   userXRefID,
  // }: {
  //   customerXRefID: string
  //   supportingPackageUUID: string
  //   journalEntryLines: JournalEntryRequest[]
  //   userXRefID: string
  // }): Promise<JournalEntryResponse[]> {
  //   await this.#entityService.validateAndGetEntities({
  //     identifiers: { uuids: [customerXRefID] },
  //   })
  //   const supportingPackage = await this.validateAndGetSupportingPackages({
  //     identifiers: {
  //       uuids: [supportingPackageUUID]
  //     }
  //   })
  //   if (isEmpty(userXRefID)) throw new HttpException(400, 'user is empty')

  //   if (journalEntryLines.length === 0) {
  //     throw new HttpException(400, 'Journal entry is empty')
  //   }

  //   for (const journalEntry of journalEntryLines) {
  //     const {
  //       accountUUID,
  //       departmentUUID,
  //       locationUUID,
  //       customerUUID,
  //       amount,
  //       memo,
  //       referenceCode,
  //       type
  //     } = journalEntry

  //     let accountID, departmentID, locationID, customerID

  //     const account = await this.#accountService.validateAndGetAccounts({
  //         identifiers: {
  //           uuids: [accountUUID],
  //         },
  //       })
  //     accountID = account.get(accountUUID).id

  //     if (departmentUUID) {
  //       const department = await this.#departmentService.validateAndGetDepartments({
  //         identifiers: {
  //           uuids: [departmentUUID]
  //         }
  //       })
  //       departmentID = department.get(departmentUUID).id
  //     }

  //     if (locationUUID) {
  //       const location = await this.#locationService.validateAndGetLocations({
  //         identifiers: {
  //           uuids: [locationUUID]
  //         }
  //       })
  //       locationID = location.get(locationUUID).id
  //     }

  //     if (customerUUID) {
  //       const customer = await this.#customerService.validateAndGetCustomers({
  //         identifiers: {
  //           uuids: [customerUUID]
  //         }
  //       })
  //       customerID = customer.get(customerUUID).id
  //     }
  //     const uuid = v4()
  //     const journalEntryObject : JournalEntryWithoutID = {
  //       uuid,
  //       amount,
  //       type,
  //       memo,
  //       supportingPackageID: supportingPackage.get(supportingPackageUUID).id,
  //       accountID,
  //       customerID,
  //       departmentID,
  //       locationID,
  //       referenceCode
  //     }

  //     await this.#journalEntriesManager.createJournalEntryLine({
  //       JournalEntry: journalEntryObject,
  //       userXRefID
  //     })

  //   }

  //   const response = await this.getJournalEntryBySupportingPackageId({
  //     supportingPackageUUID
  //   })

  //   return response
  // }

  // public async upsertSupportingPackageJournalEntries({
  //   customerXRefID,
  //   supportingPackageUUID,
  //   journalEntryLines,
  //   userXRefID,
  // }: {
  //   customerXRefID: string
  //   supportingPackageUUID: string
  //   journalEntryLines: JournalEntryRequestWithUUID[]
  //   userXRefID: string
  // }): Promise<JournalEntryResponse[]> {
  //   await this.#entityService.validateAndGetEntities({
  //     identifiers: { uuids: [customerXRefID] },
  //   })
  //   const supportingPackage = await this.validateAndGetSupportingPackages({
  //     identifiers: {
  //       uuids: [supportingPackageUUID]
  //     }
  //   })
  //   if (isEmpty(userXRefID)) throw new HttpException(400, 'user is empty')

  //   if (journalEntryLines.length === 0) {
  //     throw new HttpException(400, 'Journal entry is empty')
  //   }

  //   for (const journalEntry of journalEntryLines) {
  //     const {
  //       uuid,
  //       accountUUID,
  //       departmentUUID,
  //       locationUUID,
  //       customerUUID,
  //       amount,
  //       memo,
  //       referenceCode,
  //       type
  //     } = journalEntry

  //     if(!uuid) {
  //       throw new HttpException(400, 'Journal entry line without UUID can not updated')
  //     }

  //     const foundedJournalEntryLine = this.#journalEntriesManager.getJournalEntryLineByUUID({
  //       uuid
  //     })
  //     if(!foundedJournalEntryLine) {
  //       throw new HttpException(400, `Journal entry line with UUID : ${uuid} can not be found`)
  //     }

  //     let accountID, departmentID, locationID, customerID

  //     const account = await this.#accountService.validateAndGetAccounts({
  //         identifiers: {
  //           uuids: [accountUUID],
  //         },
  //       })
  //     accountID = account.get(accountUUID).id

  //     if (departmentUUID) {
  //       const department = await this.#departmentService.validateAndGetDepartments({
  //         identifiers: {
  //           uuids: [departmentUUID]
  //         }
  //       })
  //       departmentID = department.get(departmentUUID).id
  //     }

  //     if (locationUUID) {
  //       const location = await this.#locationService.validateAndGetLocations({
  //         identifiers: {
  //           uuids: [locationUUID]
  //         }
  //       })
  //       locationID = location.get(locationUUID).id
  //     }

  //     if (customerUUID) {
  //       const customer = await this.#customerService.validateAndGetCustomers({
  //         identifiers: {
  //           uuids: [customerUUID]
  //         }
  //       })
  //       customerID = customer.get(customerUUID).id
  //     }
  //     const journalEntryObject : JournalEntryWithoutID = {
  //       uuid,
  //       amount,
  //       type,
  //       memo,
  //       supportingPackageID: supportingPackage.get(supportingPackageUUID).id,
  //       accountID,
  //       customerID,
  //       departmentID,
  //       locationID,
  //       referenceCode
  //     }

  //     await this.#journalEntriesManager.updateJournalEntryLine({
  //       supportingPackageID: supportingPackage.get(supportingPackageUUID).id,
  //       identifier: { JournalEntryUUID: uuid},
  //       journalEntryLine: journalEntryObject,
  //       userXRefID,
  //     })

  //   }

  //   const response = await this.getJournalEntryBySupportingPackageId({
  //     supportingPackageUUID
  //   })

  //   return response
  // }

  // public async deleteSupportingPackageJournalEntries({
  //   customerXRefID,
  //   supportingPackageUUID,
  //   journalEntryLines,
  //   userXRefID,
  // }: {
  //   customerXRefID: string
  //   supportingPackageUUID: string
  //   journalEntryLines: JournalEntryRequestWithUUID[]
  //   userXRefID: string
  // }): Promise<JournalEntryResponse[]> {
  //   await this.#entityService.validateAndGetEntities({
  //     identifiers: { uuids: [customerXRefID] },
  //   })
  //   const supportingPackage = await this.validateAndGetSupportingPackages({
  //     identifiers: {
  //       uuids: [supportingPackageUUID]
  //     }
  //   })
  //   if (isEmpty(userXRefID)) throw new HttpException(400, 'user is empty')

  //   if (journalEntryLines.length === 0) {
  //     throw new HttpException(400, 'Journal entry is empty')
  //   }

  //   for (const journalEntry of journalEntryLines) {
  //     const {
  //       uuid
  //     } = journalEntry

  //     if(!uuid) {
  //       throw new HttpException(400, 'Journal entry line without UUID can not deleted')
  //     }

  //     const foundedJournalEntryLine = this.#journalEntriesManager.getJournalEntryLineByUUID({
  //       uuid
  //     })
  //     if(!foundedJournalEntryLine) {
  //       throw new HttpException(400, `Journal entry line with UUID : ${uuid} can not be found`)
  //     }


  //     await this.#journalEntriesManager.deleteJournalEntryLine({
  //       supportingPackageID: supportingPackage.get(supportingPackageUUID).id,
  //       identifier: { JournalEntryUUID: uuid},
  //       userXRefID,
  //     })
  //   }

  //   const response = await this.getJournalEntryBySupportingPackageId({
  //     supportingPackageUUID
  //   })

  //   return response
  // }

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
