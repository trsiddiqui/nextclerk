import { Router } from 'express'
import { getEntityAccounts } from './handlers/accounts'
import { getEntityCustomers } from './handlers/customers'
import { getEntityDepartments } from './handlers/departments'
import { syncIntegrationData } from './handlers/integrations'
import { getEntityLocations } from './handlers/locations'
import { getCategories } from './handlers/supportingPackages'
import { getEntityUsers } from './handlers/users'

const router = Router()

router.get(`/categories`, getCategories)

router.get(`/users`, getEntityUsers)

router.get(`/departments`, getEntityDepartments)

router.get(`/locations`, getEntityLocations)

router.get(`/accounts`, getEntityAccounts)

router.get(`/customers`, getEntityCustomers)

router.get(`/syncIntegrationData`, syncIntegrationData)

export default router
