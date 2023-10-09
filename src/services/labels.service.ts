
import { LabelsManager } from '../models'
import { Label, LabelRequestResponse } from '../types'
import EntityService from './entities.service'

export default class LabelService {

  #labelsManager: LabelsManager

  #entityService: EntityService

  constructor({
    labelsManager,
    entityService,
  }: {
    labelsManager: LabelsManager
    entityService: EntityService
  }) {
    this.#labelsManager = labelsManager
    this.#entityService = entityService
  }

  public async validateAndGetLabels({
    identifiers,
  }: {
    identifiers: { uuids: string[] } | { ids: string[] }
  }): Promise<Map<string, Label>> {

    const returnedLabels = await this.#labelsManager.getLabelsByIdentifiers({
      identifiers,
    })

    const inputLength =
      'uuids' in identifiers ? identifiers.uuids.length : identifiers.ids.length

    if (returnedLabels.length !== inputLength) {
      throw new Error('One or more of the reference Labels could not be found')
    }
    return new Map(returnedLabels.map((obj) => [obj.uuid, obj]))
  }

  public async getLabels({
    entityUuid,
  }: {
    entityUuid: string
  }): Promise<LabelRequestResponse[]> {

    const entity = await this.#entityService.validateAndGetEntities({
      identifiers: { uuids: [entityUuid] },
    })

    const labels = (await this.#labelsManager.getAllLabelsByEntityId({
      entityID: entity.get(entityUuid).id,
      txn: null
    })).filter(l => l.archivedAt === null)

    const labelResponse = labels.map(label => ({
      uuid: label.uuid,
      label: label.label
    }))

    return labelResponse
  }

  public async archiveLabel({
    customerXRefID,
    labelXRefID,
    userXRefID
  }: {
    customerXRefID: string
    labelXRefID: string
    userXRefID: string
  }): Promise<LabelRequestResponse> {

    const entity = await this.#entityService.validateAndGetEntities({
      identifiers: { uuids: [customerXRefID] },
    })

    const existingLabel = await this.#labelsManager.getLabelsByIdentifiers({
      identifiers: { uuids: [labelXRefID]},
      txn: null
    })

    const archivedLabel = await this.#labelsManager.archiveLabelByUuid({
      entityID: entity.get(customerXRefID).id,
      label: existingLabel[0],
      userXRefID,
    })



    return archivedLabel
  }

  public async createLabel({
    entityUuid,
    labelRequest,
    userXRefID
  }: {
    entityUuid: string
    labelRequest: LabelRequestResponse
    userXRefID: string
  }): Promise<LabelRequestResponse> {

    const entity = await this.#entityService.validateAndGetEntities({
      identifiers: { uuids: [entityUuid] },
    })

    const {
      label,
      uuid,
    } = labelRequest

    const createdLabel = await this.#labelsManager.createLabel({
      userXRefID,
      label: {
        uuid,
        label,
      },
      entityID: entity.get(entityUuid).id,
    })

    return {
      label: createdLabel.label,
      uuid: createdLabel.uuid
    }
  }

}
