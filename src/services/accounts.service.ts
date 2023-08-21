import { AccountsManager } from '../models'
import { Account, AccountRequest } from '../types'
import EntityService from './entities.service'

export default class AccountService {
  #accountsManager: AccountsManager

  #entityService: EntityService

  constructor({
    accountsManager,
    entityService,
  }: {
    accountsManager: AccountsManager
    entityService: EntityService
  }) {
    this.#accountsManager = accountsManager
    this.#entityService = entityService
  }

  public async validateAndGetAccounts({
    identifiers,
  }: {
    identifiers: { uuids: string[] } | { ids: string[] }
  }): Promise<Map<string, Account>> {
    const returnedAccounts = await this.#accountsManager.getAccountsByIdentifiers({
      identifiers,
    })

    const inputLength = 'uuids' in identifiers ? identifiers.uuids.length : identifiers.ids.length

    if (returnedAccounts.length !== inputLength) {
      throw new Error('One or more of the reference Categories could not be found')
    }
    return new Map(returnedAccounts.map((obj) => [obj.uuid, obj]))
  }

  public async getAccounts({ customerXRefID }: { customerXRefID: string }): Promise<Account[]> {
    const entity = await this.#entityService.validateAndGetEntities({
      identifiers: { uuids: [customerXRefID] },
    })

    const accounts = await this.#accountsManager.getAllAccounts({
      entityID:  entity.get(customerXRefID).id,
      txn: null,
    })

    return accounts
  }

  public async upsertAccounts({ accounts, userXRefID, customerXRefID }: { accounts: AccountRequest[], userXRefID: string, customerXRefID: string }): Promise<Account[]> {
    for (const account of accounts) {
      await this.#accountsManager.upsertAccounts({
        account,
        userXRefID
      })
    }

    const allAccounts = await this.getAccounts({ customerXRefID })

    return allAccounts
  }

}
