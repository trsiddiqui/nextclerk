import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {

  await knex.schema.createTable('integrations', (table) => {
    table.bigIncrements('id').notNullable().primary()
    table.string('uuid').notNullable()
    table.string('label').notNullable()
    table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now())
    table.timestamp('updatedAt').notNullable().defaultTo(knex.fn.now())
    table.timestamp('archivedAt')
    table.string('createdBy').notNullable()
    table.string('updatedBy').notNullable()
    table.string('archivedBy')
    table.unique(['uuid'])
  })

  await knex.schema.createTable('departments', (table) => {
    table.bigIncrements('id').notNullable().primary()
    table.bigInteger('integrationID').notNullable().references('id').inTable('public.integrations')
    table.bigInteger('entityID').notNullable().references('id').inTable('public.entities')
    table.string('uuid').notNullable()
    table.string('internalID').notNullable()
    table.string('label').notNullable()
    table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now())
    table.timestamp('updatedAt').notNullable().defaultTo(knex.fn.now())
    table.timestamp('archivedAt')
    table.string('createdBy').notNullable()
    table.string('updatedBy').notNullable()
    table.string('archivedBy')
    table.unique(['entityID', 'integrationID', 'uuid'])
  })

  await knex.schema.createTable('locations', (table) => {
    table.bigIncrements('id').notNullable().primary()
    table.bigInteger('integrationID').notNullable().references('id').inTable('public.integrations')
    table.bigInteger('entityID').notNullable().references('id').inTable('public.entities')
    table.string('uuid').notNullable()
    table.string('internalID').notNullable()
    table.string('label').notNullable()
    table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now())
    table.timestamp('updatedAt').notNullable().defaultTo(knex.fn.now())
    table.timestamp('archivedAt')
    table.string('createdBy').notNullable()
    table.string('updatedBy').notNullable()
    table.string('archivedBy')
    table.unique(['entityID', 'integrationID', 'uuid'])
  })

  await knex.schema.createTable('customers', (table) => {
    table.bigIncrements('id').notNullable().primary()
    table.bigInteger('integrationID').notNullable().references('id').inTable('public.integrations')
    table.bigInteger('entityID').notNullable().references('id').inTable('public.entities')
    table.string('uuid').notNullable()
    table.string('internalID').notNullable()
    table.string('label').notNullable()
    table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now())
    table.timestamp('updatedAt').notNullable().defaultTo(knex.fn.now())
    table.timestamp('archivedAt')
    table.string('createdBy').notNullable()
    table.string('updatedBy').notNullable()
    table.string('archivedBy')
    table.unique(['entityID', 'integrationID', 'uuid'])
  })

  await knex.schema.createTable('accounts', (table) => {
    table.bigIncrements('id').notNullable().primary()
    table.bigInteger('integrationID').notNullable().references('id').inTable('public.integrations')
    table.bigInteger('entityID').notNullable().references('id').inTable('public.entities')
    table.string('uuid').notNullable()
    table.string('internalID').notNullable()
    table.string('accountNumber').notNullable()
    table.string('label').notNullable()
    table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now())
    table.timestamp('updatedAt').notNullable().defaultTo(knex.fn.now())
    table.timestamp('archivedAt')
    table.string('createdBy').notNullable()
    table.string('updatedBy').notNullable()
    table.string('archivedBy')
    table.unique(['accountNumber', 'entityID', 'integrationID'])
  })

  await knex.schema.alterTable('labels', (table) => {
    table.bigInteger('entityID').notNullable().references('id').inTable('public.entities')
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('integrations')
  await knex.schema.dropTable('departments')
  await knex.schema.dropTable('accounts')
  await knex.schema.dropTable('customers')
  await knex.schema.dropTable('locations')
}

