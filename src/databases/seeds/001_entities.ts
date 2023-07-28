import { Knex } from 'knex';
import { DateTime } from 'luxon';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries

  await knex('entities').del();

  // Inserts seed entries

  await knex('entities').insert([
    {
      uuid: 'f590257b-a925-45d3-b980-26ff13faf64e',
      name: 'Entity 1',
      folderId: '014JYSVASFZQYHW35AEJE3BWF4YHC5WRKM',
      startOfFinancialYear: DateTime.now().toUTC(),
      endOfFinancialYear: DateTime.now().toUTC(),
      isPrimary: true,
      createdBy: 'testUser',
      updatedBy: 'testUSer'
    }
  ])
}
