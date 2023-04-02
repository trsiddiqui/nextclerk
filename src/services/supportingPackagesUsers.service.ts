import { DateTime } from 'luxon'
import { SupportingPackagesUsersManager } from '../models'
import { ApplicableSupportingPackagesUsersResponse, SupportingPackageUser, SupportingPackageUserRequest, SupportingPackageUserResponse, User } from '../types'
import UserService from '../services/user.service'
import { findElementsDiff } from './helpers/general'

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
  }): Promise<ApplicableSupportingPackagesUsersResponse> {

    const supportingPackagesUsersRecords = await this.#supportingPackagesUsersManager.getAllUsersSupportingPackageBySupportingPackageIDs({
      ids,
    })
    if (!supportingPackagesUsersRecords.length) {
      throw new Error('Users not found for this supporting package.')
    }

    const relationshipsMapped = supportingPackagesUsersRecords.reduce((result, current) => {
      const key = current.supportingPackageID
      return {
        ...result,
        [key]: result[key] !== undefined ? result[key].concat(current) : [current],
      }
    }, {} as Record<string, SupportingPackageUser[]>)

    const results: ApplicableSupportingPackagesUsersResponse = {}
    for (const supportingPackageId of ids) {
      if (relationshipsMapped[supportingPackageId] === undefined) {
        results[supportingPackageId] = []
      } else {
        const spUsers = supportingPackagesUsersRecords.filter(sp => sp.supportingPackageID === supportingPackageId)
        const supportingPackageUsersIds = [...new Set(spUsers.map(sp => (sp.userID)))]
        const usersEntity = await this.#usersService.getUsersByIds({
          identifiers: {
            ids: supportingPackageUsersIds,
          },
        })

        const users = relationshipsMapped[supportingPackageId].map(sp => ({
          type: sp.type,
          name: usersEntity.find(user => user.id === sp.userID).name,
          family: usersEntity.find(user => user.id === sp.userID).family,
          uuid: usersEntity.find(user => user.id === sp.userID).uuid,

        }))

        results[supportingPackageId] = users

      }
    }
    return results

  }

  public async insertSupportingPackageAndUserRelationships({
    relationships,
    userXRefID,
  }: {
    relationships: Partial<SupportingPackageUser>[]
    userXRefID: string
  }): Promise<SupportingPackageUser[]> {

    if (relationships.length === 0) {
      return []
    }

    const insertedRelationships =
      await this.#supportingPackagesUsersManager.insertSupportingPackageUsersRelation({
        supportingPackageUsersRelationships: relationships.map((relationship) => ({
          ...relationship,
          supportingPackageID: relationship.supportingPackageID,
          userID: relationship.userID,
          type: relationship.type,
        })),
        userXRefID,
      })

    return insertedRelationships
  }

  public async upsertSupportingPackageAndUserRelationship({
    supportingPackageId,
    users,
    userXRefID,
  }: {
    supportingPackageId: string
    users: SupportingPackageUserRequest[]
    userXRefID: string
  }): Promise<ApplicableSupportingPackagesUsersResponse> {
    const existingSupportingUserRelationshipsRecord = await this.getSupportingPackagesUsersBySupportingPackageIds(
      {
        ids: [supportingPackageId]
      }
    )

    const existingSupportingPackageUsersRelationships =
      existingSupportingUserRelationshipsRecord[supportingPackageId]

    const existingUsers = await this.#usersService.validateAndGetUsers({
      identifiers: {
        uuids: [...new Set(existingSupportingPackageUsersRelationships.map((user) => user.uuid))],
      },
    })
    const supportingPackageUserXRefIdsToBeRemoved = findElementsDiff(
      existingSupportingPackageUsersRelationships.map((user) => user.uuid),
      users.map((user) => user.uuid)
    )
    // const menuGroupItemsWithSameRank = menuItems.filter((mi) =>
    //   existingSupportingPackageUsersRelationships.apiResponse.find(
    //     (emi) => emi.XRefID === mi.XRefID && emi.rank === mi.rank
    //   )
    // )
    const supportingPackageUserXRefIdsToAdd = [...users.map(user => user.uuid)].filter(
      (uuid) => !supportingPackageUserXRefIdsToBeRemoved.includes(uuid)
    )

    await Promise.all(
      supportingPackageUserXRefIdsToBeRemoved.map(async (userUUID) => {
        return this.#supportingPackagesUsersManager.upsertSupportingPackageAndUserRelationship({
          supportingPackageAndUserRelationship: {
            supportingPackageID: supportingPackageId,
            userID: existingUsers.get(userUUID)?.id,
            type: existingSupportingPackageUsersRelationships.find(
              (espu) => espu.uuid === userUUID
            )?.type,
            deletedAt: DateTime.utc(),
            deletedBy: userXRefID,
          },
          userXRefID,
        })
      })
    )

    if (users.length > 0) {
      const newUsers = await this.#usersService.validateAndGetUsers({
        identifiers: {
          uuids: users.map((user) => user.uuid),
        },
      })
      await Promise.all(
        users.map(async (user) => {
          return this.#supportingPackagesUsersManager.upsertSupportingPackageAndUserRelationship({
            supportingPackageAndUserRelationship: {
              supportingPackageID: supportingPackageId,
              userID: newUsers.get(user.uuid)?.id,
              type: user.type,
              deletedAt: null,
              deletedBy: null,
            },
            userXRefID,
          })
        })
      )
    }

    const updatedRelationships = await this.getSupportingPackagesUsersBySupportingPackageIds({
      ids: [supportingPackageId],
    })

    return updatedRelationships
  }

}
