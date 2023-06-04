
import { LabelsManager } from '../models'
import { Label, LabelResponse } from '../types'
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
    entityUuid
  }: {
    entityUuid: string
  }): Promise<LabelResponse[]> {

    const entity = await this.#entityService.validateAndGetEntities({
      identifiers: { uuids: [entityUuid] },
    })

    const labels = await this.#labelsManager.getAllLabelsByEntityId({
      entityID: entity.get(entityUuid).id,
      txn: null
    })

    const labelResponse = labels.map(label => ({
      uuid: label.uuid,
      label: label.label
    }))

    return labelResponse
  }

}
