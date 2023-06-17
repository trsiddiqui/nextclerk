import { Knex } from 'knex'
import { DateTime } from 'luxon'
import { JournalEntryRequest, JournalEntryWithDate, JournalEntryWithoutID } from '@/types'

export default class JournalEntriesManager {
  #knex: Knex

  constructor(knex: Knex) {
    this.#knex = knex
  }

  public async getAllJournalEntryLinesBySupportingPackageIDs({
    txn,
    ids,
  }: {
    txn?: Knex.Transaction
    ids: number[]
  }): Promise<JournalEntryWithDate[]> {
    let query = this.#knex
      .withSchema('public')
      .table('journal_entry_details')
      .select<JournalEntryWithDate[]>('*')
      .whereIn('supportingPackageID', ids)

    if (txn) {
      query = query.transacting(txn)
    }

    const supportingPackages = await query
    return supportingPackages
  }

  public async getJournalEntryLineByUUID({
    txn,
    uuid,
  }: {
    txn?: Knex.Transaction
    uuid: string
  }): Promise<JournalEntryWithDate> {
    let query = this.#knex
      .withSchema('public')
      .table('journal_entry_details')
      .select<JournalEntryWithDate>('*')
      .where({ uuid })
      .first()

    if (txn) {
      query = query.transacting(txn)
    }

    const journalEntryLine = await query
    return journalEntryLine
  }

  public async createJournalEntryLine({
    JournalEntry,
    userXRefID,
  }: {
    JournalEntry: Partial<JournalEntryWithoutID>
    userXRefID: string
  }): Promise<JournalEntryWithDate> {
    const [createdJournalEntry] = await this.#knex
      .withSchema('public')
      .table('journal_entry_details')
      .insert({
        ...JournalEntry,
        createdAt: DateTime.utc(),
        createdBy: userXRefID,
        updatedAt: DateTime.utc(),
        updatedBy: userXRefID,
      })
      .returning<JournalEntryWithDate[]>('*')
    return createdJournalEntry
  }

  public async updateJournalEntryLine({
    supportingPackageID,
    identifier,
    journalEntryLine,
    userXRefID,
  }: {
    supportingPackageID: number
    userXRefID: string
    journalEntryLine: Partial<JournalEntryRequest>
    identifier: { JournalEntryUUID: string } | { JournalEntryID: string }
  }): Promise<JournalEntryWithDate> {
    let query = this.#knex
      .withSchema('public')
      .table('journal_entry_details')
      .update<JournalEntryWithDate>({
        ...journalEntryLine,
        updatedAt: DateTime.utc(),
        updatedBy: userXRefID,
      })
      .where({ supportingPackageID })

    if ('JournalEntryUUID' in identifier) {
      query = query.where('uuid', identifier.JournalEntryUUID)
    }

    if ('JournalEntryID' in identifier) {
      query = query.where('id', identifier.JournalEntryID)
    }

    const [journalEntryResponse] = await query.returning<JournalEntryWithDate[]>('*')
    return journalEntryResponse
  }

  public async deleteJournalEntries({
    supportingPackageID,
    identifier,
    userXRefID,
  }: {
    supportingPackageID: number
    userXRefID: string
    identifier: { JournalEntryUUIDs: string[] } | { JournalEntryIDs: number[] }
  }): Promise<void> {
    let query = this.#knex
      .withSchema('public')
      .table('journal_entry_details')
      .update({ deletedAt: DateTime.utc(), deletedBy: userXRefID})
      .where({ supportingPackageID })

    if ('JournalEntryUUIDs' in identifier) {
      query = query.whereIn('uuid', identifier.JournalEntryUUIDs)
    }

    if ('JournalEntryIDs' in identifier) {
      query = query.whereIn('id', identifier.JournalEntryIDs)
    }

    await query
  }


}
