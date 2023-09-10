import { Knex } from 'knex'

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries

  await knex('users').del()

  // Inserts seed entries

  await knex('users').insert([
    {
      uuid: '5c4e5fc6-274c-4ac3-8498-75ce6cf7575f',
      email: 'Majid@nextclerk.com',
      firstName: 'Majid',
      lastName: 'Razmjoo',
      entityID: '1',
    },
    {
      uuid: '6ece034b-7117-41ee-80c8-062029aa9580',
      email: 'Taha@nextclerk.com',
      firstName: 'Taha',
      lastName: 'Siddiqui',
      entityID: '1',
    },
    {
      uuid: 'd9166dfc-9c69-4797-b2a7-9ad22ccaff10',
      email: 'Amir@nextclerk.com',
      firstName: 'Amir',
      lastName: 'Amiri',
      entityID: '1',
    },
  ])
}
