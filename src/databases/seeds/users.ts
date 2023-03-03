import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries

  await knex('users').del();

  // Inserts seed entries

  await knex('users').insert(
    [
      {
        uuid: 'a125e9eb-8ea8-4f1f-a024-84bc65af329a',
        email: 'abc@gmail.com',
        name: 'testName',
        family: 'testFamily',
        password: 'abc123'
      }
    ]);
}

