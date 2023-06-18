import { Knex } from 'knex'

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries

  await knex('users').del()

  // Inserts seed entries

  await knex('users').insert([
    {
      uuid: '4981dd2b-02ad-4e99-b9fe-3d86e0abc9fa',
      email: 'Majid@nextclerk.com',
      firstName: 'Majid',
      lastName: 'Razmjoo',
      entityID: '1',
    },
    {
      uuid: 'bcfcc47e-4e4d-4261-be4f-7a0a9d2dd1da',
      email: 'Taha@nextclerk.com',
      firstName: 'Taha',
      lastName: 'Siddiqui',
      entityID: '1',
    },
    {
      uuid: '386861f2-61ee-4b9e-b8f5-3b9305ae77ea',
      email: 'Amir@nextclerk.com',
      firstName: 'Amir',
      lastName: 'Amiri',
      entityID: '1',
    },
  ])
}
