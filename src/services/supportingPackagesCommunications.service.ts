import { SupportingPackagesAttachmentsManager, SupportingPackagesCommunicationsAttachmentsManager, SupportingPackagesCommunicationsManager, SupportingPackagesCommunicationsUsersManager, SupportingPackagesUsersManager } from '../models'
import {
  ApplicableSupportingPackagesUsersResponse,
  SupportingPackageAttachmentRequest,
  SupportingPackageAttachmentResponse,
  SupportingPackageAttachmentResponseWithUUID,
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
        replyToCommunicationId,
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

    relationships.map( async relationship => {
      const files = await this.#fileService.validateAndGetFiles({
        identifiers: { uuids: relationship.attachments}
      })

      const users = await this.#usersService.validateAndGetUsers({
        identifiers: { uuids: relationship.users }
      })

      const insertedCommunication = await this.#supportingPackagesCommunicationsManager.upsertSupportingPackageAndCommunicationRelationship({
        supportingPackageAndCommunicationRelationship: relationship,
        userXRefID: 'testUser',
      })

      await this.#supportingPackagesCommunicationsUsersManager.upsertCommunicationUsers({
        communication: relationship.users.map((user) => ({
          communicationID: insertedCommunication.id,
          userID: parseInt( users.get(user).id)
        })),
        userXRefID,
      })

      await this.#supportingPackagesCommunicationsAttachmentsManager.upsertCommunicationAttachments({
        communication: relationship.attachments.map((file) => ({
          communicationID: insertedCommunication.id,
          fileID: files.get(file).id
        })),
        userXRefID,
      })

    })
    return this.getSupportingPackageCommunicationsBySupportingPackageId({
      id: supportingPackageId
    })
  }

}
