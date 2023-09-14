import { redis } from '@/server'
import { $UserService } from '@/services'
import { DashboardUser, KeycloakUser, User } from '@/types'
import axios from 'axios'

export class KeycloakClient {
  baseUrl = 'https://auth.nextclerk.com'
  tokenUrl = `${this.baseUrl}/realms/master/protocol/openid-connect/token`
  adminApiUrl = `${this.baseUrl}/admin/realms/nextclerk`

  async #getToken(): Promise<string> {
    let token = await redis.get('keycloak_token')
    if (token) {
      return token
    }
    const response = await axios
      .post(
        this.tokenUrl,
        new URLSearchParams({
          username: 'admin', //gave the values directly for testing
          password: 'P@55word12345',
          client_id: 'admin-cli',
          grant_type: 'password',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )
      .catch((err) => {
        throw new Error('Token could not be fetched')
      })
    await redis.set('keycloak_token', response.data.access_token, 'EX', response.data.expires_in)
    return response.data.access_token
  }

  async getUsers(): Promise<KeycloakUser[]> {
    const token = await this.#getToken()
    const { data: users } = await axios.get(`${this.adminApiUrl}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return users
  }

  async getUsersGroups({
    customerXRefID,
    dashboardUsers,
  }: {
    customerXRefID: string
    dashboardUsers: DashboardUser[]
  }): Promise<DashboardUser[]> {
    const token = await this.#getToken()
    let usersWithGroups: DashboardUser[] = []
    for (const user of dashboardUsers) {
      try {
        const { data: userGroups } = await axios.get(
          `${this.adminApiUrl}/users/${user.uuid}/groups`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        usersWithGroups.push({
          ...user,
          groups: userGroups.map((ug) => ug.name),
        })
      } catch (err) {
        console.error('An error occurred while fetching groups for ', { id: user.uuid })
      }
    }
    return usersWithGroups
  }

  async getUserGroups({ user }: { user: User }): Promise<User> {
    const token = await this.#getToken()
    try {
      const { data: userGroups } = await axios.get(
        `${this.adminApiUrl}/users/${user.uuid}/groups`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      user.groups = userGroups.map((group) => group.name)
    } catch (err) {
      console.error('An error occurred while fetching groups for ', { id: user.uuid })
    }
    return user
  }

  async getGroupObjects(): Promise<{ id: string; name: string; path: string }[]> {
    const token = await this.#getToken()
    let groups
    try {
      const { data } = await axios.get(`${this.adminApiUrl}/groups`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      groups = data
    } catch (err) {
      console.error('An error occurred while fetching groups')
    }
    return groups
  }

  async getGroups(): Promise<string[]> {
    const token = await this.#getToken()
    let groups
    try {
      const { data } = await axios.get(`${this.adminApiUrl}/groups`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      groups = data.filter((d) => d.name !== 'Super Admin').map((d) => d.name)
    } catch (err) {
      console.error('An error occurred while fetching groups')
    }
    return groups
  }

  async addUserGroup(userId: string, groupId: string): Promise<void> {
    const token = await this.#getToken()
    try {
      const { data: userGroups } = await axios.put(
        `${this.adminApiUrl}/users/${userId}/groups/${groupId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
    } catch (err) {
      console.error('An error occurred while adding groups for user', {
        user: userId,
        group: groupId,
        err,
      })
    }
  }

  async deleteUserGroup(userId: string, groupId: string): Promise<void> {
    const token = await this.#getToken()
    try {
      const { data: userGroups } = await axios.delete(
        `${this.adminApiUrl}/users/${userId}/groups/${groupId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
    } catch (err) {
      console.error('An error occurred while deleting group for user', {
        user: userId,
        group: groupId,
      })
    }
  }

  async disableUser(userId: string): Promise<void> {
    const token = await this.#getToken()
    try {
      const { data: userData } = await axios.get(`${this.adminApiUrl}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      await axios.put(
        `${this.adminApiUrl}/users/${userId}`,
        { ...userData, enabled: false },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
    } catch (err) {
      console.error('An error occurred while disabling user', {
        user: userId,
      })
    }
  }

  async updateUser(
    userId: string,
    firstName: string,
    lastName: string,
    email: string
  ): Promise<void> {
    const token = await this.#getToken()
    try {
      const { data: userData } = await axios.get(`${this.adminApiUrl}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      await axios.put(
        `${this.adminApiUrl}/users/${userId}`,
        {
          ...userData,
          firstName,
          lastName,
          email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
    } catch (err) {
      console.error('An error occurred while updating user', {
        user: userId,
      })
    }
  }

  async createUser(
    id: string,
    firstName: string,
    lastName: string,
    email: string,
    groups: string[]
  ): Promise<unknown> {
    const token = await this.#getToken()
    try {
      const resp = await axios.post(
        `${this.adminApiUrl}/users`,
        {
          emailVerified: true,
          enabled: true,
          firstName,
          lastName,
          email,
          groups,
          id,
          username: email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      return resp.data
    } catch (err) {
      console.error('An error occurred while creating user')
    }
  }

  async createUserPassword(id: string, password: string): Promise<unknown> {
    const token = await this.#getToken()
    try {
      const resp = await axios.put(
        `${this.adminApiUrl}/users/${id}/reset-password`,
        { type: 'password', temporary: false, value: password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      return resp.data
    } catch (err) {
      console.error('An error occurred while creating user')
    }
  }
}
