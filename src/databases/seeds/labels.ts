import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries

  await knex('labels').del();

  // Inserts seed entries

  await knex('labels').insert([
    {
      uuid: '78a32159-d09a-4e10-a293-e3939535a738',
      entityID: '1',
      label: 'Label 1',
      createdBy: 'testUser',
      updatedBy: 'testUSer'
    }
  ])
}
