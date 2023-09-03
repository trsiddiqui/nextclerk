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
  $CustomerAuthDetailsManager,
  $SupportingPackagesAttachmentsManager,
  $FilesManager,
  $SupportingPackagesCommunicationsManager,
  $SupportingPackagesCommunicationsAttachmentsManager,
  $SupportingPackagesCommunicationsUsersManager,
  $JournalEntriesManager,
  $TasksManager,
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
import CustomerAuthDetailsService from './customerAuthDetails.service'
import SupportingPackageAttachmentService from './supportingPackagesAttachments.service'
import FileService from './files.service'
import SupportingPackageCommunicationService from './supportingPackagesCommunications.service'
import SupportingPackageJournalEntriesService from './supportingPackagesJournalEntries.service'
import TaskService from './tasks.service'

export const $CategoryService = new CategoryService({
  categoriesManager: $CategoriesManager,
})

export const $CustomerAuthDetailsService = new CustomerAuthDetailsService({
  customerAuthDetailsManager: $CustomerAuthDetailsManager,
})


export const $EntityService = new EntityService({
  entitiesManager: $EntitiesManager,
})

export const $LabelService = new LabelService({
  labelsManager: $LabelsManager,
  entityService: $EntityService
})

export const $LocationService = new LocationService({
  locationsManager: $LocationsManager,
  entityService: $EntityService,
})

export const $CustomerService = new CustomerService({
  customersManager: $CustomersManager,
  entityService: $EntityService,
})

export const $AccountService = new AccountService({
  accountsManager: $AccountsManager,
  entityService: $EntityService,
})

export const $DepartmentService = new DepartmentService({
  departmentsManager: $DepartmentsManager,
  entityService: $EntityService,
})

export const $IntegrationService = new IntegrationService({
  entityService: $EntityService,
  accountService: $AccountService,
  customerService: $CustomerService,
  customerAuthDetailsService: $CustomerAuthDetailsService
})

export const $UserService = new UserService({
  userManager: $UserManager,
  entityService: $EntityService,
})

export const $FileService = new FileService({
  fileManager: $FilesManager,
})

export const $SupportingPackageUserService = new SupportingPackageUserService({
  supportingPackagesUsersManager: $SupportingPackagesUsersManager,
  usersService: $UserService,
})

export const $SupportingPackageAttachmentService = new SupportingPackageAttachmentService({
  supportingPackagesAttachmentsManager: $SupportingPackagesAttachmentsManager,
  fileService: $FileService,
})

export const $SupportingPackageCommunicationService = new SupportingPackageCommunicationService({
  supportingPackagesCommunicationsManager: $SupportingPackagesCommunicationsManager,
  supportingPackagesCommunicationsAttachmentsManager: $SupportingPackagesCommunicationsAttachmentsManager,
  supportingPackagesCommunicationsUsersManager: $SupportingPackagesCommunicationsUsersManager,
  fileService: $FileService,
  usersService: $UserService
})

export const $SupportingPackageJournalEntriesService = new SupportingPackageJournalEntriesService({
  journalEntriesManager: $JournalEntriesManager,
  accountService: $AccountService,
  customerService: $CustomerService,
  departmentService: $DepartmentService,
  entityService: $EntityService,
  locationService: $LocationService
})

export const $SupportingPackageService = new SupportingPackageService({
  supportingPackagesManager: $SupportingPackagesManager,
  categoryService: $CategoryService,
  labelService: $LabelService,
  entityService: $EntityService,
  userService: $UserService,
  fileService: $FileService,
  accountService: $AccountService,
  supportingPackageAttachmentService: $SupportingPackageAttachmentService,
  supportingPackagesUsersService: $SupportingPackageUserService,
  supportingPackageCommunicationService: $SupportingPackageCommunicationService,
  supportingPackageJournalEntriesService: $SupportingPackageJournalEntriesService,
  integrationService: $IntegrationService
})

export const $TaskService =new TaskService({
  tasksManager: $TasksManager,
  entityService: $EntityService,
  userService: $UserService,
  categoryService: $CategoryService,
  labelService: $LabelService,
  supportingPackageService: $SupportingPackageService
})

