import compression from 'compression'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { Router } from 'express'
import helmet from 'helmet'
import hpp from 'hpp'
import morgan from 'morgan'
import { Model } from 'objection'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { NODE_ENV, PORT, LOG_FORMAT, ORIGIN, CREDENTIALS } from '../src/config'
import knex from '../src/databases'
// import { Routes } from '@interfaces/routes.interface'
import errorMiddleware from '../src/routes/middlewares/error'
import { logger, stream } from '../src/utils/logger'
import { openApiValidatorMiddlewares } from './routes/middlewares/validation'
import supportingPackageRoutes from './routes/supportingPackage'
import fileRoutes from './routes/file'
import thirdPartyAuthRoutes from './routes/thirdPartyAuth'
import genericRoutes from './routes/shared'

class App {
  public app: express.Application
  public env: string
  public port: string | number

  constructor() {
    console.log('here')
    this.app = express()
    this.env = NODE_ENV || 'development'
    this.port = PORT || 3000

    this.connectToDatabase()
    this.initializeMiddlewares()
    this.initializeRoutes()
    this.initializeSwagger()
    this.initializeErrorHandling()
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`=================================`)
      logger.info(`======= ENV: ${this.env} =======`)
      logger.info(`🚀 App listening on the port ${this.port}`)
      logger.info(`=================================`)
    })
  }

  public getServer() {
    return this.app
  }

  private connectToDatabase() {
    Model.knex(knex)
  }

  private initializeMiddlewares() {
    this.app.use(morgan(LOG_FORMAT, { stream }))
    this.app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS }))
    this.app.use(hpp())
    this.app.use(helmet())
    this.app.use(compression())
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))
    this.app.use(cookieParser())
    this.app.use(
      ...openApiValidatorMiddlewares({
        apiSpec: 'openapi.yaml',
        validateResponses: true, // this should take care of the responses in tests
        validateApiSpec: true,
        validateRequests: true,
      })
    )
  }

  private initializeRoutes() {
    this.app.get('/api/ping', (_req, res) => {
      res.send(200)
    })
    this.app.use('/api', supportingPackageRoutes)
    this.app.use('/api', genericRoutes)
    this.app.use('/api/global', fileRoutes)
    this.app.use('/third-party-auth', thirdPartyAuthRoutes)
    this.app.use(function errorHandler(err, req, res, next) {
      console.error(err)
      res.status(500)
    })
  }

  private initializeSwagger() {
    const options = {
      swaggerDefinition: {
        openapi: '3.0.0',
        info: {
          title: 'Hello World',
          version: '1.0.0',
        },
      },
      apis: ['openapi.yaml'],
    }

    const specs = swaggerJSDoc(options)
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware)
  }
}

export default App
