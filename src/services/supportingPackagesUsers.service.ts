
import { SupportingPackagesUsersManager } from '../models'
import { SupportingPackageUser, SupportingPackageUserResponse, User } from '../types'
import UserService from '../services/user.service'

export default class SupportingPackageUserService {

  #supportingPackagesUsersManager: SupportingPackagesUsersManager

  #usersService: UserService

  constructor({
    supportingPackagesUsersManager,
    usersService,
  }: {
    supportingPackagesUsersManager: SupportingPackagesUsersManager
    usersService: UserService

  }) {
    this.#supportingPackagesUsersManager = supportingPackagesUsersManager
    this.#usersService = usersService
  }

  public async getSupportingPackagesUsersBySupportingPackageIds({
    ids,
  }: {
    ids: string[]
  }): Promise<Map<string, SupportingPackageUserResponse>> {

    const supportingPackagesUsersRecords = await this.#supportingPackagesUsersManager.getAllUsersSupportingPackageBySupportingPackageIDs({
      ids,
    })

    if (!supportingPackagesUsersRecords.length) {
      throw new Error('One or more supporting package users not found.')
    }
    const supportingPackageUsersId = supportingPackagesUsersRecords.map(sp => (sp.userID))

    const users = await this.#usersService.getUsersByIds({
      identifiers: {
        ids: supportingPackageUsersId
      }
    })
    const supportingPackagesUsers = new Map(supportingPackagesUsersRecords.map((obj) =>
      [obj.supportingPackageID,
      {
        name: users.find(user => user.id === obj.userID).name,
        family: users.find(user => user.id === obj.userID).family,
        email: users.find(user => user.id === obj.userID).email,
        ...obj
      }]))

    return supportingPackagesUsers

  }

}
