
import { CategoriesManager, UserManager } from '../models'
import { User } from '../types'

export default class UserService {

  #userManager: UserManager

  constructor({
    userManager,
  }: {
    userManager: UserManager

  }) {
    this.#userManager = userManager
  }

  public async getUsersByIds({
    identifiers,
  }: {
    identifiers: { uuids: string[] } | { ids: string[] }
  }): Promise<User[]> {
    const userResult = await this.#userManager.getUsersByIdentifiers({
      identifiers,
    })

    return userResult
  }

  public async validateAndGetUsers({
    identifiers,
  }: {
    identifiers: { uuids: string[] } | { ids: string[] }
  }): Promise<Map<string, User>> {
    const returnedUsers = await this.#userManager.getUsersByIdentifiers({
      identifiers,
    })

    const inputLength =
      'uuids' in identifiers ? identifiers.uuids.length : identifiers.ids.length

    console.log(inputLength)
    if (returnedUsers.length !== inputLength) {
      throw new Error('One or more of the reference Users could not be found.')
    }
    return new Map(returnedUsers.map((obj) => [obj.uuid, obj]))
  }

}
