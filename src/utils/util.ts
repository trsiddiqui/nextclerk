import axios from 'axios'
import querystring from 'querystring'
import { TENANT_ID, CLIENT_ID, CLIENT_CREDENTIALS, DRIVE_ID } from '../config'

/**
 * @method isEmpty
 * @param {String | Number | Object} value
 * @returns {Boolean} true & false
 * @description this value is Empty Check
 */
export const isEmpty = (value: string | number | object): boolean => {
  if (value === null) {
    return true
  } else if (typeof value !== 'number' && value === '') {
    return true
  } else if (typeof value === 'undefined' || value === undefined) {
    return true
  } else if (value !== null && typeof value === 'object' && !Object.keys(value).length) {
    return true
  } else {
    return false
  }
}

export const getAccessToken = async (): Promise<string> => {
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
  return accessToken
}
