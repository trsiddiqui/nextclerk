import { Router } from 'express'
import { getEntityAccounts } from './handlers/accounts'
import { getEntityCustomers } from './handlers/customers'
import { getEntityDepartments } from './handlers/departments'
import { syncIntegrationData } from './handlers/integrations'
import { getEntityLocations } from './handlers/locations'
import { getCategories } from './handlers/supportingPackages'
import { getEntityUsers } from './handlers/users'
import { getEntityLabels } from './handlers/labels'
import { createEntityTask, getEntityTaskByUuid, getEntityTasks } from './handlers/tasks'

const router = Router()

router.get(`/:customerXRefID/categories`, getCategories)

router.get(`/:customerXRefID/users`, getEntityUsers)

router.get(`/:customerXRefID/departments`, getEntityDepartments)

router.get(`/:customerXRefID/locations`, getEntityLocations)

router.get(`/:customerXRefID/accounts`, getEntityAccounts)

router.get(`/:customerXRefID/customers`, getEntityCustomers)

router.get(`/:entityUuid/labels`, getEntityLabels)

router.get(`/:customerXRefID/syncIntegrationData`, syncIntegrationData)

router.get(`/:entityUuid/tasks`, getEntityTasks)

router.post(`/:entityUuid/tasks`, createEntityTask)

router.get(`/:entityUuid/tasks/:taskUuid`, getEntityTaskByUuid)


export default router
