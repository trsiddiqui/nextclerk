import { CustomerAuthDetailsManager } from '@/models'
import { CustomerAuthDetails } from '@/types'

export default class CustomerAuthDetailsService {
  #customerAuthDetailsManager: CustomerAuthDetailsManager

  constructor({
    customerAuthDetailsManager,
  }: {
    customerAuthDetailsManager: CustomerAuthDetailsManager
  }) {
    this.#customerAuthDetailsManager = customerAuthDetailsManager
  }

  public async upsertCustomerAuthDetails({
    customerAuthDetails,
  }: {
    customerAuthDetails: Partial<CustomerAuthDetails>
  }): Promise<CustomerAuthDetails> {
    return this.#customerAuthDetailsManager.upsertCustomerAuthDetails({
      customerAuthDetails,
    })
  }

  public async getCustomerAuthDetailsByApplicationID({
    applicationID,
  }: {
    applicationID: string
  }): Promise<CustomerAuthDetails> {
    return this.#customerAuthDetailsManager.getCustomerAuthDetailsByApplicationID({
      applicationID,
    })
  }

  public async getCustomerAuthDetailsByEntityID({
    entityUuid,
  }: {
    entityUuid: string
  }): Promise<CustomerAuthDetails> {
    return this.#customerAuthDetailsManager.getCustomerAuthDetailsByEntityID({
      entityUuid,
    })
  }
}
