import { Router } from 'express'
import {
  quickBookAuthRequestHandler,
  quickBookAuthResponseHandler,
} from './handlers/thirdPartyAuthHandlers/quickBooksAuthHandler'
import 'express-async-errors'

const router = Router()
router.get('/quickbooks/auth-request', quickBookAuthRequestHandler)
router.get('/quickbooks', quickBookAuthResponseHandler)

export default router
