import { redis } from '@/server'
import axios from 'axios'
import { Router } from 'express'
import { resolve } from 'path'

const router = Router()
const baseUrl = 'http://localhost:8086'
const tokenUrl = `${baseUrl}/realms/master/protocol/openid-connect/token`
const adminApiUrl = `${baseUrl}/admin/realms/nextclerk`

const config = {
  adminClient: {
    realmName: 'master',
    username: 'admin',
    password: 'admin',
    grantType: 'password',
    clientId: 'admin-cli',
  },
}

// http://localhost:3000/customerXRefID/supporting-packages/123/lineItems/sheet

router.get(`/`, async (req, res) => {
  let token = await redis.get('keycloak_token')
  if (!token) {
    const response = await axios.post(
      tokenUrl,
      new URLSearchParams({
        username: 'admin', //gave the values directly for testing
        password: 'admin',
        client_id: 'admin-cli',
        grant_type: 'password',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )
    await redis.set('keycloak_token', response.data.access_token, 'EX', response.data.expires_in)
    token = response.data.access_token
  }

  // const users = await axios.get(`${adminApiUrl}/users`, {
  //   headers: {
  //     Authorization: `Bearer ${token}`,
  //   },
  // })
  let resp
  try {
    resp = await axios.post(
      `${adminApiUrl}/users`,
      {
        firstName: 'Dummy',
        lastName: 'Last',
        username: 'Dummy',
        email: 'something@someone.com',
        groups: ['CORE ADMINS'],
        enabled: true,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
  } catch (e) {
    console.error(e)
  }

  res.send(resp)
})

export default router
