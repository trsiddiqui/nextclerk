import LabelsManager from '../models/labels.model'
import CategoriesManager from '../models/categories.model'
import SupportingPackagesManager from '../models/supportingPackages.model'
import EntitiesManager from './entities.model'
import SupportingPackagesUsersManager from './supportingPackagesUsers.model'
import UserManager from './user.model'
import Knex from '../databases'
import DepartmentsManager from './departments.model'
import AccountsManager from './accounts.model'
import CustomersManager from './customers.model'
import LocationsManager from './location.model'
import CustomerAuthDetailsManager from './customerAuthDetails'
import FilesManager from './files'
import SupportingPackagesAttachmentsManager from './supportingPackagesAttachments.model'
import SupportingPackagesCommunicationsManager from './supportingPackagesCommunications.model'
import SupportingPackagesCommunicationsAttachmentsManager from './supportingPackagescommunicationsAttachments.model'
import SupportingPackagesCommunicationsUsersManager from './supportingPackagescommunicationsUsers.model'

const $LabelsManager = new LabelsManager(Knex)

const $CategoriesManager = new CategoriesManager(Knex)

const $CustomerAuthDetailsManager = new CustomerAuthDetailsManager(Knex)

const $DepartmentsManager = new DepartmentsManager(Knex)

const $AccountsManager = new AccountsManager(Knex)

const $CustomersManager = new CustomersManager(Knex)

const $LocationsManager = new LocationsManager(Knex)

const $SupportingPackagesManager = new SupportingPackagesManager(Knex)

const $EntitiesManager = new EntitiesManager(Knex)

const $SupportingPackagesUsersManager = new SupportingPackagesUsersManager(Knex)

const $UserManager = new UserManager(Knex)

const $FilesManager = new FilesManager(Knex)

const $SupportingPackagesAttachmentsManager = new SupportingPackagesAttachmentsManager(Knex)

const $SupportingPackagesCommunicationsAttachmentsManager = new SupportingPackagesCommunicationsAttachmentsManager(Knex)

const $SupportingPackagesCommunicationsUsersManager = new SupportingPackagesCommunicationsUsersManager(Knex)

const $SupportingPackagesCommunicationsManager = new SupportingPackagesCommunicationsManager(Knex)


export {
  LabelsManager,
  $LabelsManager,
  CategoriesManager,
  $CategoriesManager,
  SupportingPackagesManager,
  $SupportingPackagesManager,
  EntitiesManager,
  $EntitiesManager,
  SupportingPackagesUsersManager,
  $SupportingPackagesUsersManager,
  UserManager,
  $UserManager,
  DepartmentsManager,
  $DepartmentsManager,
  AccountsManager,
  $AccountsManager,
  CustomersManager,
  $CustomersManager,
  LocationsManager,
  $LocationsManager,
  CustomerAuthDetailsManager,
  $CustomerAuthDetailsManager,
  FilesManager,
  $FilesManager,
  SupportingPackagesAttachmentsManager,
  $SupportingPackagesAttachmentsManager,
  SupportingPackagesCommunicationsManager,
  $SupportingPackagesCommunicationsManager,
  $SupportingPackagesCommunicationsAttachmentsManager,
  SupportingPackagesCommunicationsAttachmentsManager,
  $SupportingPackagesCommunicationsUsersManager,
  SupportingPackagesCommunicationsUsersManager

}
