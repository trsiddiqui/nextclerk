import { EntityDateWithDelete } from '.'

export enum SupportingPackageUserType {
  PARTICIPANT = 'PARTICIPANT',
  APPROVER = 'APPROVER',
}

export interface SupportingPackageUser extends EntityDateWithDelete {
  id: number
  supportingPackageID: string
  userID: string
  type: SupportingPackageUserType
}

export interface SupportingPackageUserResponse {
  uuid: string
  type: SupportingPackageUserType
  firstName: string
  lastName: string
}

export interface SupportingPackageUserRequest {
  uuid: string
  type: SupportingPackageUserType
}

export type ApplicableSupportingPackagesUsersResponse = Record<
  string,
  SupportingPackageUserResponse[]
>
