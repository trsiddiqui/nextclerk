import App from '../src/app'
import validateEnv from '../src/utils/validateEnv'
import Redis from 'ioredis'
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from './config'
import { promisify } from 'util'

validateEnv()

const app = new App()

export const redis = new Redis({
  port: parseInt(REDIS_PORT), // Redis port
  host: REDIS_HOST, // Redis host
  // username: "default", // needs Redis >= 6
  password: REDIS_PASSWORD,
  // db: 0, // Defaults to 0
})

app.listen()
