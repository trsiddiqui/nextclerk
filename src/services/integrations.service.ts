import OAuthClient from 'intuit-oauth'
import EntityService from './entities.service'
import { QUICKBOOK_CLIENT_ID, QUICKBOOK_CLIENT_SECRET } from '../config'



export default class IntegrationService {

  #entityService: EntityService

  constructor({
    entityService
  }: {
    entityService: EntityService

  }) {
    this.#entityService = entityService
  }


  public async syncIntegrationData({
    customerXRefID
  }: {
    customerXRefID: string
  }): Promise<any> {

    await this.#entityService.validateAndGetEntities({
      identifiers: { uuids: [customerXRefID] },
    })

    let customers, accounts, departments, locations

    let oauth2_token_json = null

    let oauthClient = null

    oauthClient = new OAuthClient({
      clientId: QUICKBOOK_CLIENT_ID,
      clientSecret: QUICKBOOK_CLIENT_SECRET,
      environment: 'sandbox',
      redirectUri: 'http://localhost:3000/callback',
    });

    const authUri = oauthClient.authorizeUri({
      scope: [OAuthClient.scopes.Accounting],
      state: 'intuit-test',
    });


    oauthClient
      .createToken(authUri)
      .then(function (authResponse) {
        oauth2_token_json = JSON.stringify(authResponse.getJson(), null, 2)
      })
      .catch(function (e) {
        console.error(e)
      })


    oauthClient
      .makeApiCall({
        url: `https://sandbox-quickbooks.api.intuit.com/v3/company/${customerXRefID}/query?query=<select * from Customers>&minorversion=65`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
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

}