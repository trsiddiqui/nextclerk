import { hash } from 'bcrypt'
import { v4 } from 'uuid'
import { SupportingPackage, SupportingPackageRequest } from '../types/supportingPackage'
import { HttpException } from '../exceptions/HttpException'
import { SupportingPackagesManager } from '../models'
import CategoryService from '../services/categories.service'
import LabelService from '../services/labels.service'
import EntityService from './entities.service'
import { isEmpty } from '../utils/util'
import axios from 'axios'
import querystring from 'querystring'
import { TENANT_ID, CLIENT_ID, CLIENT_CREDENTIALS, DRIVE_ID } from '../config'
import knex, { Knex } from 'knex'

export default class SupportingPackageService {

  #supportingPackagesManager: SupportingPackagesManager

  #categoryService: CategoryService

  #labelService: LabelService

  #entityService: EntityService

  constructor({
    supportingPackagesManager,
    categoryService,
    labelService,
    entityService
  }: {
    supportingPackagesManager: SupportingPackagesManager
    categoryService: CategoryService
    labelService: LabelService
    entityService: EntityService
  }) {
    this.#supportingPackagesManager = supportingPackagesManager
    this.#categoryService = categoryService
    this.#labelService = labelService
    this.#entityService = entityService
  }

  public async createLineItemsSheet(customerXRefID: string): Promise<string> {
    let sharedFilePath = ''
    try {
      const accessToken = (
        await axios.post(
          `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,
          querystring.stringify({
            grant_type: 'client_credentials',
            client_secret: CLIENT_CREDENTIALS,
            client_id: CLIENT_ID,
            scope: 'https://graph.microsoft.com/.default',
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        )
      ).data.access_token

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
    userXRefID
  }: {
    customerXRefID: string
    supportingPackageRequest: SupportingPackageRequest
    userXRefID: string
  }): Promise<SupportingPackage> {
    await this.#entityService.validateAndGetEntities({
      identifiers: { uuids: [customerXRefID] }
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
      date
    } = supportingPackageRequest
    const [label, category] =
      await Promise.all([
        this.#labelService.validateAndGetLabels({
          identifiers: {
            uuids: [labelUUID],
          },
        }),
        this.#categoryService.validateAndGetCategories({
          identifiers: {
            uuids: [categoryUUID],
          },
        })
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
      approverID: 1,
    }

    console.log('before create')
    const createdSP = await this.#supportingPackagesManager.createSupportingPackage({
      supportingPackage: sp,
      userXRefID,
    })

    return createdSP
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
