
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

}
