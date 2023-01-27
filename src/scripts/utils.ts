import knex, { Knex } from 'knex'
import { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE } from '../config'

export function buildKnexConfig(): Knex.Config {
  // Resolve DB name
  const dbName = DB_DATABASE

  const connectionConfig: Knex.StaticConnectionConfig = {
    timezone: 'UTC',
    database: dbName,
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
  }

  // Postgres specific session initializsation handler
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const _initializePostgresSession = (conn: any, done: Function): void => {
    // Assumption is that this field has been validated above
    const databaseUser = DB_USER
    // Migrations in hosted environments are run by devsgit with their Postgres credentials.
    // We don't want tables to be owned by individuals, so we impersonate the db_user.
    conn.query(`SET ROLE ${databaseUser}`, (err: unknown) => {
      done(err, conn)
    })
  }

  // Resolve the final Knex Configuration
  const config: Knex.Config = {
    debug: true,
    client: 'postgresql',
    pool: {
      min: 2,
      max: 10,
    },
    connection: connectionConfig,
    acquireConnectionTimeout: 10000,
  }
  if (config.pool != null) {
    config.pool.afterCreate = _initializePostgresSession
  }
  return config
}
