import { hash } from 'bcrypt'
import { SupportingPackage } from '@/types/supportingPackage'
import { HttpException } from '@exceptions/HttpException'
// import { SupportingPackages } from '@models/users.model'
import { isEmpty } from '@utils/util'
import axios from 'axios'
import querystring from 'querystring'

class SupportingPackageService {
  public async createLineItemsSheet(customerXRefID: string): Promise<string> {
    let sharedFilePath = ''
    try {
      const accessToken = (
        await axios.post(
          'https://login.microsoftonline.com/2246f3d0-0ab6-418c-8216-db7e3afe1606/oauth2/v2.0/token',
          querystring.stringify({
            grant_type: 'client_credentials',
            client_secret: '1Ch8Q~z-bURNe8V9Hl5J6M3WEMfNLruj3ykOaaft',
            client_id: '7a399b91-aab0-405f-b613-467a799f5cf2',
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
          'https://graph.microsoft.com/v1.0/drives/b!UYBdJXCaWkudcT-Ph6QaBrHqfSgi0z1EhEcFwF3jjTP2WkslyhrKQojmj8bqorol/root:/Customers:/children',
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
          'https://graph.microsoft.com/v1.0/drives/b!UYBdJXCaWkudcT-Ph6QaBrHqfSgi0z1EhEcFwF3jjTP2WkslyhrKQojmj8bqorol/root:/Customers:/children',
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
        'https://graph.microsoft.com/v1.0/Drives/b!UYBdJXCaWkudcT-Ph6QaBrHqfSgi0z1EhEcFwF3jjTP2WkslyhrKQojmj8bqorol/Items/1E15F199-0BE0-4AAC-B94A-D007364CB3E2/copy?@microsoft.graph.conflictBehavior=replace',
        {
          name: 'LineItems.xlsx',
          parentReference: {
            driveId: 'b!UYBdJXCaWkudcT-Ph6QaBrHqfSgi0z1EhEcFwF3jjTP2WkslyhrKQojmj8bqorol',
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
          `https://graph.microsoft.com/v1.0/drives/b!UYBdJXCaWkudcT-Ph6QaBrHqfSgi0z1EhEcFwF3jjTP2WkslyhrKQojmj8bqorol/root:/Customers/${customerXRefID}:/children`,
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
          `https://graph.microsoft.com/v1.0/Drives/b!UYBdJXCaWkudcT-Ph6QaBrHqfSgi0z1EhEcFwF3jjTP2WkslyhrKQojmj8bqorol/Items/${file.id}/createLink`,
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
  // public async createSupportingPackage(userData: SupportingPackage): Promise<SupportingPackage> {
  //   if (isEmpty(userData)) throw new HttpException(400, 'userData is empty')
  //   const findSupportingPackage: SupportingPackage = await SupportingPackages.query()
  //     .select()
  //     .from('users')
  //     .where('email', '=', userData.email)
  //     .first()
  //   if (findSupportingPackage) throw new HttpException(409, `This email ${userData.email} already exists`)
  //   const hashedPassword = await hash(userData.password, 10)
  //   const createSupportingPackageData: SupportingPackage = await SupportingPackages.query()
  //     .insert({ ...userData, password: hashedPassword })
  //     .into('users')
  //   return createSupportingPackageData
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

export default SupportingPackageService
