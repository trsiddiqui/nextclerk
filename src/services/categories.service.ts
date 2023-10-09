import { DateTime } from 'luxon'
import { CategoriesManager } from '../models'
import { Category } from '../types'

export default class CategoryService {
  #categoriesManager: CategoriesManager

  constructor({ categoriesManager }: { categoriesManager: CategoriesManager }) {
    this.#categoriesManager = categoriesManager
  }

  public async validateAndGetCategories({
    identifiers,
  }: {
    identifiers: { uuids: string[] } | { ids: string[] }
  }): Promise<Map<string, Category>> {
    const returnedCategories = await this.#categoriesManager.getCategoriesByIdentifiers({
      identifiers,
    })

    const inputLength = 'uuids' in identifiers ? identifiers.uuids.length : identifiers.ids.length

    if (returnedCategories.length !== inputLength) {
      throw new Error('One or more of the reference Categories could not be found')
    }
    return new Map(returnedCategories.map((obj) => [obj.uuid, obj]))
  }

  public async getCategories(): Promise<Category[]> {
    const categories = await this.#categoriesManager.getAllCategories({
      txn: null,
    })

    const uncategorized: Category = {
      id: 0,
      createdAt: DateTime.now().toJSDate(),
      createdBy: 'SYSTEM',
      updatedAt: DateTime.now().toJSDate(),
      updatedBy: 'SYSTEM',
      name: 'UNCATEGORIZED',
      uuid: '00000000-0000-0000-0000-000000000000',
    }

    return categories.concat(uncategorized)
  }
}
