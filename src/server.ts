import App from '../src/app'
import validateEnv from '../src/utils/validateEnv'
import Redis from 'ioredis'
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from './config'


validateEnv()

const app = new App()

export const redis = new Redis({
  port: parseInt(REDIS_PORT), // Redis port
  host: REDIS_HOST, // Redis host
  password: REDIS_PASSWORD,
})

app.listen()
