import { SupportingPackageUserType } from '.'

export class User {
  public email: string
  public password: string
}

export interface User {
  id: string
  uuid: string
  email: string
  firstName: string
  lastName: string
  password: string
}

export interface UserResponse {
  uuid: string
  email: string
  firstName: string
  lastName: string
}
