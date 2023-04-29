import { Router } from 'express'
import {
  quickBookAuthRequestHandler,
  quickBookAuthResponseHandler,
} from './handlers/thirdPartyAuthHandlers/quickBooksAuthHandler'

const router = Router()
router.get('/quickbooks/auth-request', quickBookAuthRequestHandler)
router.get('/quickbooks', quickBookAuthResponseHandler)

export default router
