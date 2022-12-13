import express, { ErrorRequestHandler } from 'express';
import { middleware as OpenAPIValidator } from 'express-openapi-validator';
import { OpenApiRequestHandler } from 'express-openapi-validator/dist/framework/types';
import { OpenApiValidatorOpts } from 'express-openapi-validator/dist/openapi.validator';

export const openApiValidatorMiddlewares = (opts: OpenApiValidatorOpts): Array<OpenApiRequestHandler[] | ErrorRequestHandler> => [
  OpenAPIValidator({
    ...opts,
    validateRequests: true,
    formats: [
      {
        name: 'decimal',
        validate: (s: string): boolean => /^[+-]?([1-9]\d*|0)(\.\d+)?$/.test(s),
        type: 'string',
      },
      {
        name: 'monetary',
        validate: (s: string): boolean => /^[+-]?([1-9]\d*|0)\.\d{2}$/.test(s),
        type: 'string',
      },
      {
        name: 'accounting',
        validate: (s: string): boolean => /^[+-]?([1-9]\d*|0)\.\d{4}$/.test(s),
        type: 'string',
      },
      {
        name: 'locale',
        validate: (s: string): boolean => /^[a-z]{2}(-[A-Z]{2})?$/.test(s),
        type: 'string',
      },
      {
        name: 'semver',
        // Snipped from https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
        validate: (s: string): boolean =>
          /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/gi.test(
            s,
          ),
        type: 'string',
      },
      {
        name: 'phone',
        validate: (s: string): boolean => /^\+\d{1,3} \d{6,}/.test(s),
        type: 'string',
      },
      {
        name: 'urn',
        validate: (s: string): boolean => /^urn:[a-z0-9][a-z0-9-]{0,31}:[a-z0-9()+,\-.:=@;$_!*'%/?#]+$/.test(s),
        type: 'string',
      },
    ],
  }),
  (err: Error, _req, _res, next: express.NextFunction) => {
    next(new Error(err.message));
  },
];
