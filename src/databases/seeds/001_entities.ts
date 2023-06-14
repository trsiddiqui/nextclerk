import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries

  await knex('entities').del();

  // Inserts seed entries

  await knex('entities').insert([
    {
      uuid: 'f590257b-a925-45d3-b980-26ff13faf64e',
      name: 'Entity 1',
      folderId: '014JYSVASFZQYHW35AEJE3BWF4YHC5WRKM',
      isPrimary: true,
      createdBy: 'testUser',
      updatedBy: 'testUSer'
    }
  ])
}
