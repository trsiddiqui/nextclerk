
import { LabelsManager } from '../models'
import { Label } from '../types'

export default class LabelService {

  #labelsManager: LabelsManager

  constructor({
    labelsManager,
  }: {
    labelsManager: LabelsManager

  }) {
    this.#labelsManager = labelsManager
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

}
