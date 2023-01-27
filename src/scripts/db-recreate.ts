#!/usr/bin/env node
import knex, { Knex } from 'knex'
import yargs from 'yargs/yargs'
import { buildKnexConfig } from './utils'

const knexConfig = buildKnexConfig()
knexConfig.connection = {
  ...(knexConfig.connection as Knex.StaticConnectionConfig),
  database: 'postgres',
}
knexConfig.pool = { min: 1, max: 1 }

// This is noisy and pointless in prod, only log it dev or test.

const knexInstance = knex(knexConfig)

const dbName = 'dev'
knexInstance
  .raw(
    `
    SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity
      WHERE datname = '${dbName}' AND pid <> pg_backend_pid();
  `
  )
  .then(() => {
    knexInstance
      .raw(`DROP DATABASE IF EXISTS ??`, dbName)
      .then(() => {
        console.log('success')
      })
      .catch((err) => {
        console.error(err)
      })
      .finally(() => {
        let createQuery = `CREATE DATABASE ??`
        createQuery += ` ENCODING='UTF8'`
        knexInstance.raw(createQuery, dbName).finally(() => {
          console.log('done')
          process.exit(0)
        })
      })
  })
