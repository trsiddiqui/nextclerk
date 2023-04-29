import { Knex } from 'knex'

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries

  await knex('customer_auth_details').del()

  // Inserts seed entries

  await knex('customer_auth_details').insert([
    {
      entityUuid: 'f590257b-a925-45d3-b980-26ff13faf64e',
      clientID: process.env.TEMP_QUICKBOOKS_CLIENT_ID,
      clientSecret: process.env.TEMP_QUICKBOOKS_CLIENT_SECRET,
      applicationID: process.env.TEMP_QUICKBOOKS_APPLICATION_ID,
      refreshToken: null,
      refreshTokenExpiry: null,
    },
  ])
}
