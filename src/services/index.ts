import {
  $LabelsManager,
  $CategoriesManager,
  $SupportingPackagesManager,
  $EntitiesManager,
  $UserManager,
  $SupportingPackagesUsersManager,
  $DepartmentsManager,
  $LocationsManager,
  $CustomersManager,
  $AccountsManager,
} from '../models'
import CategoryService from '../services/categories.service'
import LabelService from '../services/labels.service'
import SupportingPackageService from '../services/supportingPackages.service'
import EntityService from './entities.service'
import UserService from './user.service'
import SupportingPackageUserService from './supportingPackagesUsers.service'
import DepartmentService from './departments.service'
import LocationService from './locations.service'
import CustomerService from './customers.service'
import AccountService from './accounts.service'
import IntegrationService from './integrations.service'

export const $CategoryService = new CategoryService({
  categoriesManager: $CategoriesManager
})

export const $LabelService = new LabelService({
  labelsManager: $LabelsManager
})

export const $EntityService = new EntityService({
  entitiesManager: $EntitiesManager
})

export const $LocationService = new LocationService({
  locationsManager: $LocationsManager,
  entityService: $EntityService
})

export const $CustomerService = new CustomerService({
  customersManager: $CustomersManager,
  entityService: $EntityService
})

export const $AccountService = new AccountService({
  accountsManager: $AccountsManager,
  entityService: $EntityService
})

export const $DepartmentService = new DepartmentService({
  departmentsManager: $DepartmentsManager,
  entityService: $EntityService
})

export const $IntegrationService = new IntegrationService({
  entityService: $EntityService
})

export const $UserService = new UserService({
  userManager: $UserManager,
  entityService: $EntityService
})

export const $SupportingPackageUserService = new SupportingPackageUserService({
  supportingPackagesUsersManager: $SupportingPackagesUsersManager,
  usersService: $UserService
})

export const $SupportingPackageService = new SupportingPackageService({
  supportingPackagesManager: $SupportingPackagesManager,
  categoryService: $CategoryService,
  labelService: $LabelService,
  entityService: $EntityService,
  userService: $UserService,
  supportingPackagesUsersService: $SupportingPackageUserService
})