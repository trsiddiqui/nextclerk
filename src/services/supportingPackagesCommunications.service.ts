import { v4 } from 'uuid'
import { SupportingPackagesAttachmentsManager, SupportingPackagesCommunicationsAttachmentsManager, SupportingPackagesCommunicationsManager, SupportingPackagesCommunicationsUsersManager, SupportingPackagesUsersManager } from '../models'
import {
  ApplicableSupportingPackagesUsersResponse,
  SupportingPackageAttachmentRequest,
  SupportingPackageAttachmentResponse,
  SupportingPackageAttachmentResponseWithUUID,
  SupportingPackageCommunication,
  SupportingPackageCommunicationAttachmentResponse,
  SupportingPackageCommunicationRequest,
  SupportingPackageCommunicationResponse,
  SupportingPackageCommunicationUserResponse,
  SupportingPackageUser,
  SupportingPackageUserRequest,
  SupportingPackageUserResponse,
  User,
} from '../types'
import UserService from '../services/user.service'
import FileService from './files.service'

export default class SupportingPackageCommunicationService {
  #supportingPackagesCommunicationsManager: SupportingPackagesCommunicationsManager

  #supportingPackagesCommunicationsUsersManager: SupportingPackagesCommunicationsUsersManager

  #supportingPackagesCommunicationsAttachmentsManager: SupportingPackagesCommunicationsAttachmentsManager

  #fileService: FileService

  #usersService: UserService

  constructor({
    supportingPackagesCommunicationsManager,
    supportingPackagesCommunicationsUsersManager,
    supportingPackagesCommunicationsAttachmentsManager,
    fileService,
    usersService
  }: {
    supportingPackagesCommunicationsManager: SupportingPackagesCommunicationsManager
    supportingPackagesCommunicationsUsersManager: SupportingPackagesCommunicationsUsersManager
    supportingPackagesCommunicationsAttachmentsManager: SupportingPackagesCommunicationsAttachmentsManager
    fileService: FileService
    usersService: UserService
  }) {
    this.#supportingPackagesCommunicationsManager = supportingPackagesCommunicationsManager
    this.#supportingPackagesCommunicationsUsersManager = supportingPackagesCommunicationsUsersManager
    this.#supportingPackagesCommunicationsAttachmentsManager = supportingPackagesCommunicationsAttachmentsManager
    this.#fileService = fileService
    this.#usersService = usersService

  }

  public async validateAndGetCommunications({
    identifiers,
  }: {
    identifiers: { uuids: string[] } | { ids: string[] }
  }): Promise<Map<string, SupportingPackageCommunication>> {
    const returnedCommunications = await this.#supportingPackagesCommunicationsManager.getSupportingPackageCommunicationsByIdentifiers({
      identifiers,
    })

    const inputLength =
      'uuids' in identifiers ? identifiers.uuids.length : identifiers.ids.length

    if (returnedCommunications.length !== inputLength) {
      throw new Error('One or more of the reference Communications could not be found')
    }
    return new Map(returnedCommunications.map((obj) => [obj.uuid, obj]))
  }

  public async getSupportingPackageCommunicationsBySupportingPackageIdAndCommunicationUUID({
    supportingPackageId,
    communicationUUIDs,
  }: {
    supportingPackageId: number
    communicationUUIDs: string[]
  }): Promise<SupportingPackageCommunicationResponse[] | null> {
    const supportingPackageCommunications =
      await this.#supportingPackagesCommunicationsManager.getSupportingPackageCommunicationsBySupportingPackageIDAndCommunicationUUID(
        {
          id: supportingPackageId,
          uuids: communicationUUIDs
        }
      )
    if (!supportingPackageCommunications.length) {
      return null
    }
    const result : SupportingPackageCommunicationResponse[] = []
    for (const spc of supportingPackageCommunications){
      const {
        uuid,
        text,
        cellLink,
        isCellLinkValid,
        replyToCommunicationId,
        isChangeRequest,
        createdBy,
        createdAt,
        updatedBy,
        updatedAt,
        archivedBy,
        archivedAt,
      } = spc
      const replyToCommunication = await this.validateAndGetCommunications({
        identifiers: {
          ids: [replyToCommunicationId.toString()]
        }
      })
      const replyToCommunicationUUID = replyToCommunication.entries().next().value[0]
      const attachments : SupportingPackageCommunicationAttachmentResponse[] = []
      const users : SupportingPackageCommunicationUserResponse[] = []
      const spcAttachments = await this.#supportingPackagesCommunicationsAttachmentsManager.getSupportingPackageCommunicationsAttachmentsByCommunicationId({
        communicationID: spc.id
      })
      const spcAttachmentsResponse = await this.#fileService.validateAndGetFilesByIds({
        identifiers: { ids: spcAttachments.map( spca => spca.fileID.toString()) }
      })
      spcAttachmentsResponse.forEach(spar => {
        attachments.push({
          name: spar.name,
          uuid: spar.uuid,
          mimeType: spar.mimeType
        })
      })
      const spcUsers = await this.#supportingPackagesCommunicationsUsersManager.getSupportingPackageCommunicationsUsersByCommunicationId({
        communicationID: spc.id
      })
      const spcUsersResponse = await this.#usersService.getUsersByIds({
        identifiers: { ids: spcUsers.map(spcu => spcu.userID.toString())}
      })

      spcUsersResponse.forEach(spcur => {
        users.push({
          uuid: spcur.uuid,
          name: spcur.firstName,
          family: spcur.lastName
        })
      })

      result.push({
        uuid,
        text,
        cellLink,
        isCellLinkValid,
        replyToCommunicationUUID,
        isChangeRequest,
        createdBy,
        createdAt,
        updatedBy,
        updatedAt,
        archivedBy,
        archivedAt,
        users,
        attachments
      })
    }
    return result
  }
  public async getSupportingPackageCommunicationsBySupportingPackageId({
    id,
  }: {
    id: number
  }): Promise<SupportingPackageCommunicationResponse[]> {
    const supportingPackageCommunications =
      await this.#supportingPackagesCommunicationsManager.getSupportingPackageCommunicationsBySupportingPackageID(
        {
          id,
        }
      )
    if (!supportingPackageCommunications.length) {
      return []
    }

    const result : SupportingPackageCommunicationResponse[] = []

    for (const spc of supportingPackageCommunications){
      const {
        uuid,
        text,
        cellLink,
        isCellLinkValid,
        replyToCommunicationId,
        isChangeRequest,
        createdBy,
        createdAt,
        updatedBy,
        updatedAt,
        archivedBy,
        archivedAt,
      } = spc
      let replyToCommunicationUUID
      if (replyToCommunicationId) {
        const replyToCommunication = await this.validateAndGetCommunications({
          identifiers: {
            ids: [replyToCommunicationId.toString()]
          }
        })
        replyToCommunicationUUID = replyToCommunication.entries().next().value[0]
      }
      const attachments : SupportingPackageCommunicationAttachmentResponse[] = []
      const users : SupportingPackageCommunicationUserResponse[] = []
      const spcAttachments = await this.#supportingPackagesCommunicationsAttachmentsManager.getSupportingPackageCommunicationsAttachmentsByCommunicationId({
        communicationID: spc.id
      })
      const spcAttachmentsResponse = await this.#fileService.validateAndGetFilesByIds({
        identifiers: { ids: spcAttachments.map( spca => spca.fileID.toString()) }
      })
      spcAttachmentsResponse.forEach(spar => {
        attachments.push({
          name: spar.name,
          uuid: spar.uuid,
          mimeType: spar.mimeType
        })
      })
      const spcUsers = await this.#supportingPackagesCommunicationsUsersManager.getSupportingPackageCommunicationsUsersByCommunicationId({
        communicationID: spc.id
      })
      const spcUsersResponse = await this.#usersService.getUsersByIds({
        identifiers: { ids: spcUsers.map(spcu => spcu.userID.toString())}
      })

      spcUsersResponse.forEach(spcur => {
        users.push({
          uuid: spcur.uuid,
          name: spcur.firstName,
          family: spcur.lastName
        })
      })

      result.push({
        uuid,
        text,
        cellLink,
        isCellLinkValid,
        replyToCommunicationUUID: replyToCommunicationUUID ?? null ,
        isChangeRequest,
        createdBy,
        createdAt,
        updatedBy,
        updatedAt,
        archivedBy,
        archivedAt,
        users,
        attachments

      })
    }
    return result
  }

  public async insertSupportingPackageAndCommunicationsRelationships({
    relationships,
    supportingPackageId,
    userXRefID,
  }: {
    relationships: Partial<SupportingPackageCommunicationRequest>[]
    supportingPackageId: number
    userXRefID: string
  }): Promise<SupportingPackageCommunicationResponse[]> {
    if (relationships.length === 0) {
      return []
    }

    for(const relation of relationships) {
      let replyToCommunication
      if (relation.replyToCommunicationUUID){
        replyToCommunication = await this.validateAndGetCommunications({
          identifiers: {
            uuids: [relation.replyToCommunicationUUID],
          },
        })
      }


      const [attachments , users] = await Promise.all([
        this.#fileService.validateAndGetFiles({
          identifiers: {
            uuids: [...new Set(relation.attachments)],
          },
        }),
        this.#usersService.validateAndGetUsers({
          identifiers: {
            uuids: [...new Set(relation.users)],
          },
        })
      ])
      const uuid = v4()

      const insertedCommunication = await this.#supportingPackagesCommunicationsManager.upsertSupportingPackageAndCommunicationRelationship({
        supportingPackageAndCommunicationRelationship: {
          uuid,
          text: relation.text,
          cellLink: relation.cellLink,
          isCellLinkValid: relation.isCellLinkValid,
          isChangeRequest: relation.isChangeRequest,
          replyToCommunicationId: relation.replyToCommunicationUUID ? replyToCommunication.get(relation.replyToCommunicationUUID).id : null,
        },
        supportingPackageID: supportingPackageId,
        userXRefID: 'testUser',
      })

      await this.#supportingPackagesCommunicationsUsersManager.insertCommunicationUsers({
        communications: relation.users.map((user) => ({
          communicationID: insertedCommunication.id,
          userID: parseInt( users.get(user).id)
        })),
        userXRefID,
      })

      await this.#supportingPackagesCommunicationsAttachmentsManager.insertCommunicationAttachments({
        communications: relation.attachments.map((file) => ({
          communicationID: insertedCommunication.id,
          fileID: attachments.get(file).id
        })),
        userXRefID,
      })

    }
    return this.getSupportingPackageCommunicationsBySupportingPackageId({
      id: supportingPackageId
    })
  }

}
