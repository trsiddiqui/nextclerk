import { Knex } from 'knex'

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries

  await knex('departments').del()

  // Inserts seed entries

  await knex('departments').insert([
    {
      integrationID: 1,
      entityID: 1,
      uuid: '0e52d9c0-33e4-470b-8bba-7d96b8240d51',
      internalID: 'CS1',
      label: 'IT',
      createdBy: 'testUser',
      updatedBy: 'testUSer',
    },
    // {
    //   integrationID: 1001,
    //   entityID: 10001,
    //   uuid: '4a5278b1-0530-4757-ad52-81994856afc1',
    //   internalID: 'CS2',
    //   label: 'ACCOUNTING',
    //   createdBy: 'testUser',
    //   updatedBy: 'testUSer'
    // }
  ])
}
