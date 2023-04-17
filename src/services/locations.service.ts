
import { LocationsManager } from '../models'
import { Location } from '../types'
import EntityService from './entities.service'

export default class LocationService {

  #locationsManager: LocationsManager

  #entityService: EntityService

  constructor({
    locationsManager,
    entityService,
  }: {
    locationsManager: LocationsManager
    entityService: EntityService

  }) {
    this.#locationsManager = locationsManager
    this.#entityService = entityService
  }

  public async validateAndGetLocations({
    identifiers,
  }: {
    identifiers: { uuids: string[] } | { ids: string[] }
  }): Promise<Map<string, Location>> {
    const returnedLocations = await this.#locationsManager.getLocationsByIdentifiers({
      identifiers,
    })

    const inputLength =
      'uuids' in identifiers ? identifiers.uuids.length : identifiers.ids.length

    if (returnedLocations.length !== inputLength) {
      throw new Error('One or more of the reference Categories could not be found')
    }
    return new Map(returnedLocations.map((obj) => [obj.uuid, obj]))
  }

  public async getLocations({
    customerXRefID
  }: {
    customerXRefID: string
  }): Promise<Location[]> {

    const entity = await this.#entityService.validateAndGetEntities({
      identifiers: { uuids: [customerXRefID] },
    })

    const Locations = await this.#locationsManager.getAllLocations({
      entityID: entity.get(customerXRefID).id,
      txn: null
    })

    return Locations
  }

}
