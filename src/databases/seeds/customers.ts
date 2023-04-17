import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries

  await knex('customers').del();

  // Inserts seed entries

  // await knex('customers').insert([
  //   {
  //     integrationID: 1001,
  //     entityID: 10001,
  //     uuid: '73c35f1c-7707-439c-bc9d-359be309cdac',
  //     internalID: 'CS1',
  //     label: 'Customer 1',
  //     createdBy: 'testUser',
  //     updatedBy: 'testUSer'
  //   },
  //   {
  //     integrationID: 1001,
  //     entityID: 10001,
  //     uuid: '239aa74b-f1a7-49a3-8437-884298398395',
  //     internalID: 'CS2',
  //     label: 'Customer 2',
  //     createdBy: 'testUser',
  //     updatedBy: 'testUSer'
  //   }
  // ])

}