import { Router } from 'express'
import { getEntityAccounts } from './handlers/accounts'
import { getEntityCustomers } from './handlers/customers'
import { getEntityDepartments } from './handlers/departments'
import { syncIntegrationData } from './handlers/integrations'
import { getEntityLocations } from './handlers/locations'
import { getCategories } from './handlers/supportingPackages'
import { getEntityUsers } from './handlers/users'
import { getEntityLabels } from './handlers/labels'
import {
  createEntityTask,
  deleteTask,
  getEntityTaskByUuid,
  getEntityTasks,
  updateTask,
} from './handlers/tasks'
import { getEntity } from './handlers/entities'
import 'express-async-errors'

const router = Router()

router.get(`/:customerXRefID/categories`, getCategories)

router.get(`/:customerXRefID/departments`, getEntityDepartments)

router.get(`/:customerXRefID/locations`, getEntityLocations)

router.get(`/:customerXRefID/accounts`, getEntityAccounts)

router.get(`/:customerXRefID/customers`, getEntityCustomers)

router.get(`/:entityUuid/labels`, getEntityLabels)

router.get(`/entity/:entityUuid`, getEntity)

router.get(`/:customerXRefID/syncIntegrationData`, syncIntegrationData)

router.get(`/:customerXRefID/tasks`, getEntityTasks)

router.post(`/:customerXRefID/tasks`, createEntityTask)

router.get(`/:customerXRefID/tasks/:taskUuid`, getEntityTaskByUuid)

router.put(`/:customerXRefID/tasks/:taskUuid`, updateTask)

router.delete(`/:entityUuid/tasks/:taskUuid`, deleteTask)

router.get(`/:customerXRefID/users`, getEntityUsers)

export default router
