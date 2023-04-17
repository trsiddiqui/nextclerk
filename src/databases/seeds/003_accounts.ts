import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries

  await knex('accounts').del();

  // Inserts seed entries

  // await knex('accounts').insert([
  //   {
  //     integrationID: '1',
  //     entityID: '1',
  //     uuid: 'cc6aec54-d658-43dc-96b4-0eb0aaac93e1',
  //     internalID: 'CS1',
  //     accountNumber: '100',
  //     label: 'CASH',
  //     createdBy: 'testUser',
  //     updatedBy: 'testUSer'
  //   },
  //   {
  //     integrationID: 1001,
  //     entityID: 10001,
  //     uuid: '9f227502-8875-4c3a-961e-a386bae9e61c',
  //     internalID: 'CS2',
  //     accountNumber: '101',
  //     label: 'BANK',
  //     createdBy: 'testUser',
  //     updatedBy: 'testUSer'
  //   }
  // ])

}