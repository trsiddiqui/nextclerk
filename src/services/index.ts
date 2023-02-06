import {
  $LabelsManager,
  $CategoriesManager,
  $SupportingPackagesManager,
  $EntitiesManager,
} from '../models'
import CategoryService from '../services/categories.service'
import LabelService from '../services/labels.service'
import SupportingPackageService from '../services/supportingPackages.service'
import EntityService from './entities.service'

export const $CategoryService = new CategoryService({
  categoriesManager: $CategoriesManager
})

export const $LabelService = new LabelService({
  labelsManager: $LabelsManager
})

export const $EntityService = new EntityService({
  entitiesManager: $EntitiesManager
})

export const $SupportingPackageService = new SupportingPackageService({
  supportingPackagesManager: $SupportingPackagesManager,
  categoryService: $CategoryService,
  labelService: $LabelService,
  entityService: $EntityService
})