import express, { ErrorRequestHandler } from 'express'
import { middleware as OpenAPIValidator } from 'express-openapi-validator'
import { OpenApiRequestHandler } from 'express-openapi-validator/dist/framework/types'
import { OpenApiValidatorOpts } from 'express-openapi-validator/dist/openapi.validator'

export const openApiValidatorMiddlewares = (
  opts: OpenApiValidatorOpts
): Array<OpenApiRequestHandler[] | ErrorRequestHandler> => [
  OpenAPIValidator({
    ...opts,
    validateRequests: true,
  }),
  (err: Error, _req, _res, next: express.NextFunction) => {
    next(new Error(err.message))
  },
]
