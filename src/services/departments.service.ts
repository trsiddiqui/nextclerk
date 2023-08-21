
import { DepartmentsManager } from '../models'
import { Department } from '../types'
import EntityService from './entities.service'

export default class DepartmentService {

  #departmentsManager: DepartmentsManager

  #entityService: EntityService

  constructor({
    departmentsManager,
    entityService,
  }: {
    departmentsManager: DepartmentsManager
    entityService: EntityService

  }) {
    this.#departmentsManager = departmentsManager
    this.#entityService = entityService
  }

  public async validateAndGetDepartments({
    identifiers,
  }: {
    identifiers: { uuids: string[] } | { ids: string[] }
  }): Promise<Map<string, Department>> {
    const returnedDepartments = await this.#departmentsManager.getDepartmentsByIdentifiers({
      identifiers,
    })

    const inputLength =
      'uuids' in identifiers ? identifiers.uuids.length : identifiers.ids.length

    if (returnedDepartments.length !== inputLength) {
      throw new Error('One or more of the reference Categories could not be found')
    }
    return new Map(returnedDepartments.map((obj) => [obj.uuid, obj]))
  }

  public async getDepartments({
    customerXRefID
  }: {
    customerXRefID: string
  }): Promise<Department[]> {

    const entity = await this.#entityService.validateAndGetEntities({
      identifiers: { uuids: [customerXRefID] },
    })

    const departments = await this.#departmentsManager.getAllDepartments({
      entityID: entity.get(customerXRefID).id,
      txn: null
    })

    return departments
  }

  public async upsertDepartments({
    customerXRefID,
    departments
  }: {
    customerXRefID: string
    departments: Partial<Department>[]
  }): Promise<Department[]> {

    const userXRefID = 'SYSTEM'

    const entity = await this.#entityService.validateAndGetEntities({
      identifiers: {
        uuids: [customerXRefID]
      }
    })

    const result : Department[] = []

    for (const department of departments) {
      const upsertedDepartment = await this.#departmentsManager.upsertDepartments({
        entityID: entity.get(customerXRefID).id,
        department,
        userXRefID
      })
      result.push(upsertedDepartment)
    }

    return result

  }

}
