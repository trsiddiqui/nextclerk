import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', table => {
    table.bigIncrements('id').unsigned().primary();
    table.string('uuid').notNullable()
    table.string('email', 45).notNullable();
    table.string('name', 100).notNullable()
    table.string('family', 100).notNullable()
    table.string('password', 255).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('users');
}
