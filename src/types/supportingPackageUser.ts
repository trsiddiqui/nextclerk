import { EntityDateWithDelete } from "."

export enum SupportingPackageUserType {
  PARTICIPANT = 'PARTICIPANT',
  APPROVER = 'APPROVER'
}

export interface SupportingPackageUser extends EntityDateWithDelete {
  id: number
  supportingPackageID: string
  userID: string
  type: SupportingPackageUserType
}

export interface SupportingPackageUserResponse {
  supportingPackageID: string
  userID: string
  type: SupportingPackageUserType
  name: string
  family: string
  email: string
}