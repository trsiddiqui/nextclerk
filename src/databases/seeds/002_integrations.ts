import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries

  await knex('integrations').del();

  // Inserts seed entries

  await knex('integrations').insert([
    {
      uuid: '1c3bb235-6774-4e64-9070-bc2a6e36bbd9',
      label: 'Quick Books',
      createdBy: 'testUser',
      updatedBy: 'testUSer'
    }
  ])
}