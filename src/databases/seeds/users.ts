import { Knex } from 'knex'
import { v4 as uuid } from 'uuid'

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries

  await knex('users').del()

  // Inserts seed entries

  await knex('users').insert([
    {
      uuid: uuid(),
      email: 'Majid@nextclerk.com',
      firstName: 'Majid',
      lastName: 'Razmjoo',
      entityID: '1',
    },
    {
      uuid: uuid(),
      email: 'Taha@nextclerk.com',
      firstName: 'Taha',
      lastName: 'Siddiqui',
      entityID: '1',
    },
    {
      uuid: uuid(),
      email: 'Amir@nextclerk.com',
      firstName: 'Amir',
      lastName: 'Amiri',
      entityID: '1',
    },
  ])
}
