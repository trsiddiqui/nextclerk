import {
  $LabelsManager,
  $CategoriesManager,
  $SupportingPackagesManager
} from '../models'
import CategoryService from '../services/categories.service'
import LabelService from '../services/labels.service'
import SupportingPackageService from '../services/supportingPackages.service'

export const $CategoryService = new CategoryService({
  categoriesManager: $CategoriesManager
})

export const $LabelService = new LabelService({
  labelsManager: $LabelsManager
})

export const $SupportingPackageService = new SupportingPackageService({
  supportingPackagesManager: $SupportingPackagesManager,
  categoryService: $CategoryService,
  labelService: $LabelService
})