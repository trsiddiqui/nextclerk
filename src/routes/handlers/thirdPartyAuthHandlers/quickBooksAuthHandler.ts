import OAuthClient from 'intuit-oauth'
import { NextFunction, Request, Response } from 'express'
import {
  QUICKBOOKS_CALLBACK_API,
  QUICKBOOKS_CALLBACK_API_PROD,
  TEMP_QUICKBOOKS_CLIENT_ID,
  TEMP_QUICKBOOKS_CLIENT_SECRET,
} from '@/config'
import { $CustomerAuthDetailsService, $IntegrationService } from '@/services'
import { QuickbooksAuthTokenResponse } from '@/types/http/quickbookAuthResponse'
import { redis } from '@/server'
import { env } from 'process'

// TO BE CALLED FOR ENABLING AUTH
// CLIENTID and CLIENTSECRET will be POSTed and stored in a separate call
export const quickBookAuthRequestHandler = async (
  req: Request & { query: { entityID: string } },
  res: Response,
  next: NextFunction
): Promise<void> => {
  // use api validation to make sure its called with entityUUID
  const customerAuthDetails = await $CustomerAuthDetailsService.getCustomerAuthDetailsByEntityID({
    entityUuid: req.query.entityID,
  })

  if (!customerAuthDetails) {
    res.send(404)
    return
  }

  try {
    const oauthClient = new OAuthClient({
      clientId: customerAuthDetails.clientID,
      clientSecret: customerAuthDetails.clientSecret,
      environment: 'sandbox',
      redirectUri: QUICKBOOKS_CALLBACK_API_PROD
    })

    const authUri = oauthClient.authorizeUri({
      scope: [
        OAuthClient.scopes.Accounting,
        // OAuthClient.scopes.OpenId
      ],
      state: 'testState',
    })
    res.set('Access-Control-Allow-Origin', '*')

    res.send(authUri)
  } catch (error) {
    next(error)
  }
}

export const quickBookAuthResponseHandler = async (
  req: Request & { query: { realmId: string } },
  res: Response,
  next: NextFunction
): Promise<void> => {
  const result = await redis.get(req.query.realmId)
  if (result) {
    await $IntegrationService.syncIntegrationData({
      customerXRefID: 'f590257b-a925-45d3-b980-26ff13faf64e',
      realmId: req.query.realmId,
      userXRefID: 'test user'
    })
    res.send(200)
    return
  }
  const customerAuthDetails =
    await $CustomerAuthDetailsService.getCustomerAuthDetailsByApplicationID({
      applicationID: req.query.realmId,
    })
  const oauthClient = new OAuthClient({
    clientId: customerAuthDetails.clientID,
    clientSecret: customerAuthDetails.clientSecret,
    environment: 'sandbox',
    redirectUri: QUICKBOOKS_CALLBACK_API_PROD,
  })

  oauthClient
    .createToken(req.url)
    .then(async (authResponse: QuickbooksAuthTokenResponse) => {
      await $CustomerAuthDetailsService.upsertCustomerAuthDetails({
        customerAuthDetails: {
          ...customerAuthDetails,
          applicationID: req.query.realmId,
          refreshToken: authResponse.token.refresh_token,
          refreshTokenExpiry: new Date(
            authResponse.token.createdAt + authResponse.token.x_refresh_token_expires_in * 1000
          ),
        },
      })

      await redis.set(
        req.query.realmId,
        authResponse.token.access_token,
        'EX',
        authResponse.token.expires_in
      )
      await $IntegrationService.syncIntegrationData({
        customerXRefID: 'f590257b-a925-45d3-b980-26ff13faf64e',
        realmId: req.query.realmId,
        userXRefID: 'test user'
      })
      res.send(200)
    })
    .catch(function (e) {
      console.error(e)
    })
}
