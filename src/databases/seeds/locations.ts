import { Knex } from 'knex'

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries

  await knex('locations').del()

  // Inserts seed entries

  await knex('locations').insert([
    {
      integrationID: 1,
      entityID: 1,
      uuid: 'c3cb85d7-99f4-4c5f-b605-6c7e25e886e8',
      internalID: 'CS1',
      label: 'Location 1',
      createdBy: 'testUser',
      updatedBy: 'testUSer',
    },
    // {
    //   integrationID: 1001,
    //   entityID: 10001,
    //   uuid: '2cea4c7f-d5ad-4115-98dd-08125dc106f6',
    //   internalID: 'CS2',
    //   label: 'Location 2',
    //   createdBy: 'testUser',
    //   updatedBy: 'testUSer'
    // }
  ])
}
