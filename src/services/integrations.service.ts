import OAuthClient from 'intuit-oauth'
import { v4 } from 'uuid'
import axios from 'axios'
import EntityService from './entities.service'
import { TEMP_QUICKBOOKS_CLIENT_ID, TEMP_QUICKBOOKS_CLIENT_SECRET } from '../config'
import { redis } from '@/server'
import { AccountRequest, CustomerRequest, QuickBookAccount, QuickBookCustomer } from '@/types'
import AccountService from './accounts.service'
import CustomerService from './customers.service'
import CustomerAuthDetailsService from './customerAuthDetails.service'

export default class IntegrationService {
  #entityService: EntityService

  #accountService: AccountService

  #customerService: CustomerService

  #customerAuthDetailsService: CustomerAuthDetailsService

  constructor({
    entityService,
    accountService,
    customerService,
    customerAuthDetailsService
  }: {
    entityService: EntityService
    accountService: AccountService
    customerService: CustomerService
    customerAuthDetailsService: CustomerAuthDetailsService
  }) {
    this.#entityService = entityService
    this.#accountService = accountService
    this.#customerService = customerService
    this.#customerAuthDetailsService = customerAuthDetailsService
  }

  private parseQBAccountData({
    entityID,
    accounts,
    userXRefID
  }: {
    entityID: string
    accounts: QuickBookAccount[]
    userXRefID: string

  }) : AccountRequest[] {
    const parsedAccounts: AccountRequest [] = []
    for( const acc of accounts) {
      const parsedAccount : AccountRequest = {
        uuid : v4(),
        accountNumber : acc.Id,
        integrationID : 1,
        entityID : entityID,
        parentID: acc.ParentRef?.value ? parseInt(acc.ParentRef?.value) : null,
        internalID : parseInt(acc.Id),
        label : acc.FullyQualifiedName,
        initialBalance : acc.CurrentBalance,
        latestBalance : acc.CurrentBalance,
        createdBy :userXRefID,
        updatedBy :userXRefID,


      }
      parsedAccounts.push(parsedAccount)
    }
    return parsedAccounts
  }

  private parseQBCustomerData({
    entityID,
    customers,
    userXRefID
  }: {
    entityID: string
    customers: QuickBookCustomer[]
    userXRefID: string

  }) : CustomerRequest[] {
    const parsedCustomers: CustomerRequest [] = []
    for( const customer of customers) {
      const parsedCustomer : CustomerRequest = {
        uuid : v4(),
        integrationID : 1,
        entityID : entityID,
        internalID : parseInt(customer.Id),
        label : customer.FullyQualifiedName,
        createdBy :userXRefID,
        updatedBy :userXRefID,
      }
      parsedCustomers.push(parsedCustomer)
    }
    return parsedCustomers
  }

  public async getQBToken({ customerXRefID }: { customerXRefID: string }): Promise<{
    realmId: string,
    token: string
  }> {
    let realmId,token
    const entityAuth =  await this.#customerAuthDetailsService.getCustomerAuthDetailsByEntityID({
      entityUuid: customerXRefID
    })
    if (!entityAuth) {
      throw Error('user does not have integration. please do integration for first time!')
    }

    realmId = entityAuth.applicationID
    token = await redis.get(realmId)

    if (token) {
      return {
        realmId,
        token
      }
    }
    const basicToken = Buffer.from(entityAuth.clientID + ":" + entityAuth.clientSecret).toString('base64')

    const axiosConfig = {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${basicToken}`,
      }
    }
    const data = {
      grant_type : 'refresh_token',
      refresh_token: entityAuth.refreshToken
    }

    try {
      const newTokenResponse = await axios.post(
        'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
        data,
        axiosConfig
      )

      await this.#customerAuthDetailsService.upsertCustomerAuthDetails({
        customerAuthDetails: {
          ...entityAuth,
          applicationID: realmId,
          refreshToken: newTokenResponse.data.refresh_token,
          refreshTokenExpiry: new Date(
            Date.now() + newTokenResponse.data.x_refresh_token_expires_in * 1000
          ),
        },
      })
      await redis.set(
        realmId,
        newTokenResponse.data.access_token,
        'EX',
        newTokenResponse.data.expires_in
      )

    } catch (err) {
      console.error(
        err.response.status,
        err.response.data.error.message
      )
    }

    return {
      realmId,
      token: entityAuth.refreshToken
    }
  }

  public async thirdPartyAuth({ customerXRefID }: { customerXRefID: string }): Promise<any> {
    await this.#entityService.validateAndGetEntities({
      identifiers: { uuids: [customerXRefID] },
    })

    let customers, accounts, departments, locations

    let oauth2_token_json = null

    let oauthClient = null

    oauthClient = new OAuthClient({
      clientId: TEMP_QUICKBOOKS_CLIENT_ID,
      clientSecret: TEMP_QUICKBOOKS_CLIENT_SECRET,
      environment: 'sandbox',
      redirectUri: 'http://localhost:3000/callback',
    })

    const authUri = oauthClient.authorizeUri({
      scope: [OAuthClient.scopes.Accounting, OAuthClient.scopes.OpenId],
      state: 'testState',
    })

    return authUri

    // oauthClient
    //   .createToken(authUri)
    //   .then(function (authResponse) {
    //     console.log(authResponse.body)
    //     oauth2_token_json = JSON.stringify(authResponse.getJson(), null, 2)
    //     console.log(oauth2_token_json)
    //   })
    //   .catch(function (e) {
    //     console.error(e)
    //   })

    // oauthClient
    //   .makeApiCall({
    //     url: `https://sandbox-quickbooks.api.intuit.com/v3/company/${customerXRefID}/query?query=<select * from Customers>&minorversion=65`,
    //     method: 'GET',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //   })
    //   .then(function (response) {
    //     console.log('The API response is  : ' + response)
    //     customers = response
    //   })
    //   .catch(function (e) {
    //     console.log('The error is ' + JSON.stringify(e))
    //   })

    // oauthClient
    //   .makeApiCall({
    //     url: `https://sandbox-quickbooks.api.intuit.com/v3/company/${customerXRefID}/query?query=<select * from Department>&minorversion=65`,
    //     method: 'GET',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //   })
    //   .then(function (response) {
    //     console.log('The API response is  : ' + response)
    //     departments = response
    //   })
    //   .catch(function (e) {
    //     console.log('The error is ' + JSON.stringify(e))
    //   })

    // oauthClient
    //   .makeApiCall({
    //     url: `https://sandbox-quickbooks.api.intuit.com/v3/company/${customerXRefID}/query?query=<select * from Account>&minorversion=65`,
    //     method: 'GET',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //   })
    //   .then(function (response) {
    //     console.log('The API response is  : ' + response)
    //     accounts = response
    //   })
    //   .catch(function (e) {
    //     console.log('The error is ' + JSON.stringify(e))
    //   })
  }

  public async syncIntegrationData(
    { customerXRefID,
      realmId,
      userXRefID
    }:
    {
      customerXRefID: string
      realmId: string
      userXRefID: string
    }): Promise<any> {
    const entity = await this.#entityService.validateAndGetEntities({
      identifiers: { uuids: [customerXRefID] },
    })

    let oauthClient = null
    // TODO: get from table based on customer xrefid
    const token = await redis.get(realmId)
    const axiosConfig = {
      headers: {
        "content-type": "application/json",
        "Authorization": `Bearer ${token}`,
      }
    }

    const accountData = await axios.get(
      `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/query?query=select * from account&minorversion=65`,
      axiosConfig
    )

    const customerData = await axios.get(
      `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/query?query=select * from customer&minorversion=65`,
      axiosConfig
    )

    const { Account } = accountData.data.QueryResponse
    const { Customer } = customerData.data.QueryResponse

    console.log(Customer)

    const accounts = this.parseQBAccountData({
      accounts: Account,
      entityID: entity.get(customerXRefID).id.toString(),
      userXRefID
    })

    const customers = this.parseQBCustomerData({
      customers: Customer,
      entityID: entity.get(customerXRefID).id.toString(),
      userXRefID
    })

    await this.#accountService.upsertAccounts({
      accounts,
      customerXRefID,
      userXRefID
    })

    await this.#customerService.upsertCustomers({
      customers,
      customerXRefID,
      userXRefID
    })

    // const classData = await axios.get(
    //   `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/query?query=select * from Class&minorversion=65`,
    //   axiosConfig
    // )

    // const companyData = await axios.get(
    //   `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/query?query=select * from CompanyInfo&minorversion=65`,
    //   axiosConfig
    // )

  }

  public async syncIntegration({ customerXRefID, realmId }: { customerXRefID: string, realmId: string }): Promise<any> {
    // await this.#entityService.validateAndGetEntities({
    //   identifiers: { uuids: [customerXRefID] },
    // })

    let customers, accounts, departments, locations


    const result = await redis.get(realmId)

    let oauth2_token_json = null

    let oauthClient = null

    // oauthClient = new OAuthClient({
    //   clientId: TEMP_QUICKBOOKS_CLIENT_ID,
    //   clientSecret: TEMP_QUICKBOOKS_CLIENT_SECRET,
    //   environment: 'sandbox',
    //   redirectUri: 'http://localhost:3000/callback',
    // })

    // const authUri = oauthClient.authorizeUri({
    //   scope: [OAuthClient.scopes.Accounting, OAuthClient.scopes.OpenId],
    //   state: 'testState',
    // })

    // return authUri

    // oauthClient
    //   .createToken(authUri)
    //   .then(function (authResponse) {
    //     console.log(authResponse.body)
    //     oauth2_token_json = JSON.stringify(authResponse.getJson(), null, 2)
    //     console.log(oauth2_token_json)
    //   })
    //   .catch(function (e) {
    //     console.error(e)
    //   })

    const x = redis.get(realmId)

    oauthClient
      .makeApiCall({
        url: `https://sandbox-quickbooks.api.intuit.com/v3/company/${customerXRefID}/query?query=<select * from Customers>&minorversion=65`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        accesstoken: result
      })
      .then(function (response) {
        console.log('The API response is  : ' + response)
        customers = response
      })
      .catch(function (e) {
        console.log('The error is ' + JSON.stringify(e))
      })

    oauthClient
      .makeApiCall({
        url: `https://sandbox-quickbooks.api.intuit.com/v3/company/${customerXRefID}/query?query=<select * from Department>&minorversion=65`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(function (response) {
        console.log('The API response is  : ' + response)
        departments = response
      })
      .catch(function (e) {
        console.log('The error is ' + JSON.stringify(e))
      })

    oauthClient
      .makeApiCall({
        url: `https://sandbox-quickbooks.api.intuit.com/v3/company/${customerXRefID}/query?query=<select * from Account>&minorversion=65`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(function (response) {
        console.log('The API response is  : ' + response)
        accounts = response
      })
      .catch(function (e) {
        console.log('The error is ' + JSON.stringify(e))
      })
  }
}

