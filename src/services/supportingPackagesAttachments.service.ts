import { SupportingPackagesAttachmentsManager } from '../models'
import {
  SupportingPackageAttachmentRequest,
  SupportingPackageAttachmentResponse,
  SupportingPackageAttachmentResponseWithUUID,
  supportingPackageFile,
} from '../types'
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
      identifiers: {
        ids: [...new Set(supportingPackagesAttachmentsRecords.map((sr) => sr.fileID.toString()))],
      },
    })
    const supportingPackageFiles = supportingPackagesAttachmentsRecords.map((spf) => ({
      uuid: files.get(spf.fileID.toString()).uuid,
      isMaster: spf.isMaster,
      highLights: spf.highLights,
      name: spf.name,
      mimeType: spf.mimeType,
      size: spf.size,
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
          highLights: relationship.highLights,
          isMaster: relationship.isMaster,
          size: relationship.size,
        })),
        userXRefID,
      })

    return insertedRelationships
  }

  public async upsertSupportingPackageAndAttachmentRelationships({
    supportingPackageId,
    attachments,
    userXRefID,
  }: {
    supportingPackageId: string
    attachments: supportingPackageFile[]
    userXRefID: string
  }): Promise<SupportingPackageAttachmentResponseWithUUID[]> {
    const existingSupportingPackageAttachmentsRelationships =
      await this.getSupportingPackagesAttachmentsBySupportingPackageId({
        id: supportingPackageId,
      })

    const existingAttachments = await this.#fileService.validateAndGetFiles({
      identifiers: {
        uuids: [
          ...new Set(existingSupportingPackageAttachmentsRelationships.map((file) => file.uuid)),
        ],
      },
    })

    const supportingPackageAttachmentsToBeRemoved =
      existingSupportingPackageAttachmentsRelationships.filter(
        (ar) => attachments.map((attachment) => attachment.uuid).indexOf(ar.uuid) === -1
      )

    await Promise.all(
      supportingPackageAttachmentsToBeRemoved.map(async (spAttachment) => {
        return this.#supportingPackagesAttachmentsManager.upsertSupportingPackageAndAttachmentRelationship(
          {
            supportingPackageAndAttachmentRelationship: {
              supportingPackageID: parseInt(supportingPackageId),
              fileID: existingAttachments.get(spAttachment.uuid)?.id,
              deletedAt: DateTime.utc().toJSDate(),
              deletedBy: userXRefID,
            },
            userXRefID,
          }
        )
      })
    )

    if (attachments.length > 0) {
      const newAttachments = await this.#fileService.validateAndGetFiles({
        identifiers: {
          uuids: attachments.map((attachment) => attachment.uuid),
        },
      })
      await Promise.all(
        attachments.map(async (attachment) => {
          return this.#supportingPackagesAttachmentsManager.upsertSupportingPackageAndAttachmentRelationship(
            {
              supportingPackageAndAttachmentRelationship: {
                supportingPackageID: parseInt(supportingPackageId),
                fileID: newAttachments.get(attachment.uuid)?.id,
                isMaster: attachment.isMaster,
                deletedAt: null,
                deletedBy: null,
              },
              userXRefID,
            }
          )
        })
      )
    }

    const updatedRelationships = await this.getSupportingPackagesAttachmentsBySupportingPackageId({
      id: supportingPackageId,
    })

    return updatedRelationships
  }
}
