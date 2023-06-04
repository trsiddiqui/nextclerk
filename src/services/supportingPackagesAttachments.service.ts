import { SupportingPackagesAttachmentsManager, SupportingPackagesUsersManager } from '../models'
import {
  ApplicableSupportingPackagesUsersResponse,
  SupportingPackageAttachmentRequest,
  SupportingPackageAttachmentResponse,
  SupportingPackageAttachmentResponseWithUUID,
  SupportingPackageUser,
  SupportingPackageUserRequest,
  SupportingPackageUserResponse,
  User,
} from '../types'
import UserService from '../services/user.service'
import { findElementsDiff } from './helpers/general'
import { DateTime } from 'luxon'
import FileService from './files.service'

export default class SupportingPackageAttachmentService {
  #supportingPackagesAttachmentsManager: SupportingPackagesAttachmentsManager

  #fileService: FileService

  constructor({
    supportingPackagesAttachmentsManager,
    fileService,
  }: {
    supportingPackagesAttachmentsManager: SupportingPackagesAttachmentsManager
    fileService: FileService
  }) {
    this.#supportingPackagesAttachmentsManager = supportingPackagesAttachmentsManager
    this.#fileService = fileService
  }

  public async getSupportingPackagesAttachmentsBySupportingPackageId({
    id,
  }: {
    id: string
  }): Promise<SupportingPackageAttachmentResponseWithUUID[]> {
    const supportingPackagesAttachmentsRecords =
      await this.#supportingPackagesAttachmentsManager.getAllAttachmentsSupportingPackageBySupportingPackageID(
        {
          id,
        }
      )
    if (!supportingPackagesAttachmentsRecords.length) {
      return []
    }

    const files = await this.#fileService.validateAndGetFilesByIds({
      identifiers: { ids: [... new Set(supportingPackagesAttachmentsRecords.map( sr => sr.fileID.toString()))]}
    })

    const supportingPackageFiles = supportingPackagesAttachmentsRecords.map( spf => ({
      uuid: files.get(spf.fileID.toString()).uuid,
      isMaster: spf.isMaster,
      name: spf.name,
      mimeType: spf.mimeType
    }))

    return supportingPackageFiles

  }

  public async insertSupportingPackageAndAttachmentRelationships({
    relationships,
    userXRefID,
  }: {
    relationships: Partial<SupportingPackageAttachmentRequest>[]
    userXRefID: string
  }): Promise<SupportingPackageAttachmentResponse[]> {
    if (relationships.length === 0) {
      return []
    }

    const insertedRelationships =
      await this.#supportingPackagesAttachmentsManager.insertSupportingPackageAttachmentsRelation({
        supportingPackageAttachmentsRelationships: relationships.map((relationship) => ({
          ...relationship,
          supportingPackageID: relationship.supportingPackageID,
          fileID: relationship.fileID,
          mimeType: relationship.mimeType,
          name: relationship.name,
          isMaster: relationship.isMaster
        })),
        userXRefID,
      })

    return insertedRelationships
  }

}
