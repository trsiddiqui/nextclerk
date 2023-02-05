import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries

  await knex('categories').del();

  // Inserts seed entries

  await knex('categories').insert([
    {
      uuid: 'ca874e4a-2cca-48d1-9cba-6a0d86c8d2d6',
      name: 'AP',
      createdBy: 'testUser',
      updatedBy: 'testUSer'
    }
  ]);
}