import { v4 } from 'uuid'
import { HttpException } from '../exceptions/HttpException'
import { JournalEntriesManager } from '../models'
import EntityService from './entities.service'
import { isEmpty } from '../utils/util'
import { JournalEntryRequest, JournalEntryResponse, JournalEntryWithoutID } from '@/types'
import AccountService from './accounts.service'
import DepartmentService from './departments.service'
import LocationService from './locations.service'
import CustomerService from './customers.service'
import { findElementsDiff } from '@/services/helpers/general'

export default class SupportingPackageJournalEntriesService {
  #entityService: EntityService

  #accountService: AccountService

  #departmentService: DepartmentService

  #locationService: LocationService

  #customerService: CustomerService

  #journalEntriesManager: JournalEntriesManager

  constructor({
    entityService,
    accountService,
    departmentService,
    locationService,
    customerService,
    journalEntriesManager,
  }: {
    entityService: EntityService
    accountService: AccountService
    departmentService: DepartmentService
    locationService: LocationService
    customerService: CustomerService
    journalEntriesManager: JournalEntriesManager
  }) {
    this.#entityService = entityService
    this.#accountService = accountService
    this.#departmentService = departmentService
    this.#locationService = locationService
    this.#customerService = customerService
    this.#journalEntriesManager = journalEntriesManager
  }

  public async getJournalEntryBySupportingPackageId({
    supportingPackageId,
  }: {
    supportingPackageId: number
  }): Promise<JournalEntryResponse[]> {
    const journalEntryLines =
      await this.#journalEntriesManager.getAllJournalEntryLinesBySupportingPackageIDs({
        ids: [supportingPackageId],
      })
    return journalEntryLines
  }

  public async insertSupportingPackageJournalEntries({
    supportingPackageId,
    journalEntries,
    userXRefID,
  }: {
    supportingPackageId: number
    journalEntries: JournalEntryRequest[]
    userXRefID: string
  }): Promise<JournalEntryResponse[]> {
    if (isEmpty(userXRefID)) throw new HttpException(400, 'user is empty')

    if (journalEntries.length === 0) {
      throw new HttpException(400, 'Journal entry is empty')
    }

    for (const journalEntry of journalEntries) {
      const {
        accountUUID,
        departmentUUID,
        locationUUID,
        customerUUID,
        creditAmount,
        debitAmount,
        memo,
        referenceCode,
        cellLink,
      } = journalEntry

      if (creditAmount && debitAmount) {
        throw new HttpException(
          400,
          'Journal entry line is not valid. debit and credit in the same line!!'
        )
      }

      let accountID, departmentID, locationID, customerID

      const account = await this.#accountService.validateAndGetAccounts({
        identifiers: {
          uuids: [accountUUID],
        },
      })
      accountID = account.get(accountUUID).id

      if (departmentUUID) {
        const department = await this.#departmentService.validateAndGetDepartments({
          identifiers: {
            uuids: [departmentUUID],
          },
        })
        departmentID = department.get(departmentUUID).id
      }

      if (locationUUID) {
        const location = await this.#locationService.validateAndGetLocations({
          identifiers: {
            uuids: [locationUUID],
          },
        })
        locationID = location.get(locationUUID).id
      }

      if (customerUUID) {
        const customer = await this.#customerService.validateAndGetCustomers({
          identifiers: {
            uuids: [customerUUID],
          },
        })
        customerID = customer.get(customerUUID).id
      }
      const uuid = v4()
      const journalEntryObject: JournalEntryWithoutID = {
        uuid,
        debitAmount,
        creditAmount,
        cellLink,
        memo,
        supportingPackageID: supportingPackageId,
        accountID,
        customerID,
        departmentID,
        locationID,
        referenceCode,
      }

      await this.#journalEntriesManager.createJournalEntryLine({
        JournalEntry: journalEntryObject,
        userXRefID,
      })
    }

    const response = await this.getJournalEntryBySupportingPackageId({
      supportingPackageId,
    })

    return response
  }

  public async upsertSupportingPackageJournalEntries({
    supportingPackageId,
    journalEntries,
    userXRefID,
  }: {
    supportingPackageId: number
    journalEntries: JournalEntryRequest[]
    userXRefID: string
  }): Promise<JournalEntryResponse[]> {
    if (isEmpty(userXRefID)) throw new HttpException(400, 'user is empty')
    const existingJournalEntries = await this.getJournalEntryBySupportingPackageId({
      supportingPackageId,
    })
    const journalEntriesWithUUID = journalEntries.filter((je) => je.uuid !== undefined)

    const toBeRemovedJournalEntries = findElementsDiff(
      existingJournalEntries.map((je) => je.uuid),
      journalEntriesWithUUID.map((je) => je.uuid)
    )

    await this.#journalEntriesManager.deleteJournalEntries({
      supportingPackageID: supportingPackageId,
      identifier: {
        JournalEntryUUIDs: toBeRemovedJournalEntries,
      },
      userXRefID,
    })

    const newJournalEntries = journalEntries.filter((je) => je.uuid === undefined)

    await this.insertSupportingPackageJournalEntries({
      supportingPackageId,
      userXRefID,
      journalEntries: newJournalEntries,
    })

    const journalEntryUUIDsToUpdate = findElementsDiff(
      journalEntriesWithUUID.map((je) => je.uuid),
      toBeRemovedJournalEntries
    )

    for (const journalEntryUUID of journalEntryUUIDsToUpdate) {
      const foundedJE = journalEntriesWithUUID.find((je) => je.uuid === journalEntryUUID)
      const {
        uuid,
        accountUUID,
        departmentUUID,
        locationUUID,
        customerUUID,
        debitAmount,
        creditAmount,
        memo,
        referenceCode,
        cellLink,
      } = foundedJE

      if (!uuid) {
        throw new HttpException(400, 'Journal entry line without UUID can not updated')
      }

      const foundedJournalEntryLine = this.#journalEntriesManager.getJournalEntryLineByUUID({
        uuid,
      })
      if (!foundedJournalEntryLine) {
        throw new HttpException(400, `Journal entry line with UUID : ${uuid} can not be found`)
      }

      let accountID, departmentID, locationID, customerID

      const account = await this.#accountService.validateAndGetAccounts({
        identifiers: {
          uuids: [accountUUID],
        },
      })
      accountID = account.get(accountUUID).id

      if (departmentUUID) {
        const department = await this.#departmentService.validateAndGetDepartments({
          identifiers: {
            uuids: [departmentUUID],
          },
        })
        departmentID = department.get(departmentUUID).id
      }

      if (locationUUID) {
        const location = await this.#locationService.validateAndGetLocations({
          identifiers: {
            uuids: [locationUUID],
          },
        })
        locationID = location.get(locationUUID).id
      }

      if (customerUUID) {
        const customer = await this.#customerService.validateAndGetCustomers({
          identifiers: {
            uuids: [customerUUID],
          },
        })
        customerID = customer.get(customerUUID).id
      }
      const journalEntryObject: JournalEntryWithoutID = {
        uuid,
        creditAmount,
        debitAmount,
        memo,
        supportingPackageID: supportingPackageId,
        accountID,
        customerID,
        departmentID,
        locationID,
        referenceCode,
        cellLink,
      }

      await this.#journalEntriesManager.updateJournalEntryLine({
        supportingPackageID: supportingPackageId,
        identifier: { JournalEntryUUID: uuid },
        journalEntryLine: journalEntryObject,
        userXRefID,
      })
    }

    const response = await this.getJournalEntryBySupportingPackageId({
      supportingPackageId,
    })

    return response
  }

  public async deleteSupportingPackageJournalEntries({
    customerXRefID,
    supportingPackageId,
    journalEntries,
    userXRefID,
  }: {
    customerXRefID: string
    supportingPackageId: number
    journalEntries: JournalEntryRequest[]
    userXRefID: string
  }): Promise<JournalEntryResponse[]> {
    await this.#entityService.validateAndGetEntities({
      identifiers: { uuids: [customerXRefID] },
    })

    if (isEmpty(userXRefID)) throw new HttpException(400, 'user is empty')

    if (journalEntries.length === 0) {
      throw new HttpException(400, 'Journal entry is empty')
    }

    for (const journalEntry of journalEntries) {
      const { uuid } = journalEntry

      if (!uuid) {
        throw new HttpException(400, 'Journal entry line without UUID can not deleted')
      }

      const foundedJournalEntryLine = this.#journalEntriesManager.getJournalEntryLineByUUID({
        uuid,
      })
      if (!foundedJournalEntryLine) {
        throw new HttpException(400, `Journal entry line with UUID : ${uuid} can not be found`)
      }

      await this.#journalEntriesManager.deleteJournalEntries({
        supportingPackageID: supportingPackageId,
        identifier: { JournalEntryUUIDs: [uuid] },
        userXRefID,
      })
    }

    const response = await this.getJournalEntryBySupportingPackageId({
      supportingPackageId,
    })

    return response
  }
}
