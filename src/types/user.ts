import { DateTime } from 'luxon'
import { SupportingPackageUserType } from '.'

export type User = {
  id: number
  uuid: string
  email: string
  firstName: string
  lastName: string
  entityID: number
  managerID?: number
  departmentID?: number
  isAccountingManager: boolean
  archivedAt?: DateTime
  archivedBy?: string
  groups?: string[]
}

export type UserRequest = Omit<User, 'entityID' | 'managerID' | 'departmentID'> & {
  entityUuid: string
  managerUuid: string
  departmentUuid: string
}

export type DashboardUser = {
  uuid: string
  email: string
  firstName: string
  lastName: string
  groups?: string[]
  manager?: {
    firstName: string
    lastName: string
    uuid: string
    email: string
  }
  department: {
    label: string
    uuid: string
  }
  isAccountingManager: boolean
  archived: boolean
}

export interface UserResponse {
  id: number
  uuid: string
  email: string
  firstName: string
  lastName: string
}

export type KeycloakUser = {
  id: string
  createdTimestamp: number
  username: string
  enabled: boolean
  totp: boolean
  emailVerified: boolean
  firstName: string
  lastName: string
  email: string
}
