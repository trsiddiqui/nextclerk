import OAuthClient from 'intuit-oauth'
import axios from 'axios'
import EntityService from './entities.service'
import { TEMP_QUICKBOOKS_CLIENT_ID, TEMP_QUICKBOOKS_CLIENT_SECRET } from '../config'
import { redis } from '@/server'

export default class IntegrationService {
  #entityService: EntityService

  constructor({ entityService }: { entityService: EntityService }) {
    this.#entityService = entityService
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

  public async syncIntegrationData({ customerXRefID }: { customerXRefID: string }): Promise<any> {
    await this.#entityService.validateAndGetEntities({
      identifiers: { uuids: [customerXRefID] },
    })

    let customers, accounts, departments, locations

    let oauth2_token_json = null

    let oauthClient = null
    // TODO: get from table based on customer xrefid
    const token = await redis.get('4620816365325240560')

    // axios.get('http://example.com', {
    //   headers: {
    //     'Authorization', `Bearer ${token}`
    //   },
    // })
    // .then(response => response)
    // .catch(error => error)

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

    oauthClient
      .makeApiCall({
        url: `https://sandbox-quickbooks.api.intuit.com/v3/company/${customerXRefID}/query?query=<select * from Account></select>&minorversion=65`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
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
