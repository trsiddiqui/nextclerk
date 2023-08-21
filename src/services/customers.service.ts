
import { CustomersManager } from '../models'
import { Customer, CustomerRequest } from '../types'
import EntityService from './entities.service'

export default class CustomerService {

  #customersManager: CustomersManager

  #entityService: EntityService

  constructor({
    customersManager,
    entityService,
  }: {
    customersManager: CustomersManager
    entityService: EntityService

  }) {
    this.#customersManager = customersManager
    this.#entityService = entityService
  }

  public async validateAndGetCustomers({
    identifiers,
  }: {
    identifiers: { uuids: string[] } | { ids: string[] }
  }): Promise<Map<string, Customer>> {
    const returnedCustomers = await this.#customersManager.getCustomersByIdentifiers({
      identifiers,
    })

    const inputLength =
      'uuids' in identifiers ? identifiers.uuids.length : identifiers.ids.length

    if (returnedCustomers.length !== inputLength) {
      throw new Error('One or more of the reference Categories could not be found')
    }
    return new Map(returnedCustomers.map((obj) => [obj.uuid, obj]))
  }

  public async getCustomers({
    customerXRefID
  }: {
    customerXRefID: string
  }): Promise<Customer[]> {

    const entity = await this.#entityService.validateAndGetEntities({
      identifiers: { uuids: [customerXRefID] },
    })

    const Customers = await this.#customersManager.getAllCustomers({
      entityID: entity.get(customerXRefID).id,
      txn: null
    })

    return Customers
  }

  public async upsertCustomers({ customers, userXRefID, customerXRefID }: { customers: CustomerRequest[], userXRefID: string, customerXRefID: string }): Promise<Customer[]> {
    for (const customer of customers) {
      await this.#customersManager.upsertCustomers({
        customer,
        userXRefID
      })
    }

    const allCustomers = await this.getCustomers({ customerXRefID })

    return allCustomers
  }

}
