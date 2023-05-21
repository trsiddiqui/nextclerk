import { CategoriesManager, UserManager } from '../models'
import { SupportingPackageUserResponse, User, UserResponse } from '../types'
import EntityService from './entities.service'

export default class UserService {
  #userManager: UserManager

  #entityService: EntityService

  constructor({
    userManager,
    entityService,
  }: {
    userManager: UserManager
    entityService: EntityService
  }) {
    this.#userManager = userManager
    this.#entityService = entityService
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

    const inputLength = 'uuids' in identifiers ? identifiers.uuids.length : identifiers.ids.length

    // if (returnedUsers.length !== inputLength) {
    //   throw new Error('One or more of the reference Users could not be found.')
    // }
    return new Map(returnedUsers.map((obj) => [obj.uuid, obj]))
  }

  public async getEntitiesUsers({
    customerXRefID,
    search,
  }: {
    customerXRefID: string
    search?: string
  }): Promise<UserResponse[]> {
    const entities = await this.#entityService.validateAndGetEntities({
      identifiers: { uuids: [customerXRefID] },
    })

    const entityUsers = await this.#userManager.getUsersByEntityIdsAndKeyword({
      entityID: entities.get(customerXRefID).id,
      search,
    })

    return entityUsers.map((eu) => ({
      firstName: eu.firstName,
      lastName: eu.lastName,
      uuid: eu.uuid,
      email: eu.email,
    }))
  }
}
