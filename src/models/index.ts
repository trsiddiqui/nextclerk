import LabelsManager from '../models/labels.model'
import CategoriesManager from '../models/categories.model'
import SupportingPackagesManager from '../models/supportingPackages.model'
import EntitiesManager from './entities.model'
import SupportingPackagesUsersManager from './supportingPackagesUsers.model'
import UserManager from './user.model'
import Knex from '../databases'

const $LabelsManager = new LabelsManager(Knex)

const $CategoriesManager = new CategoriesManager(Knex)

const $SupportingPackagesManager = new SupportingPackagesManager(Knex)

const $EntitiesManager = new EntitiesManager(Knex)

const $SupportingPackagesUsersManager = new SupportingPackagesUsersManager(Knex)

const $UserManager = new UserManager(Knex)


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
}
