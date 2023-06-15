import { EntityDateWithDelete } from "./common"

export enum JETypes {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT'
}

export interface JournalEntry {
  id: number
  uuid: string
  supportingPackageID: number
  accountID: number
  departmentID?: number
  locationID?: number
  customerID?: number
  referenceCode?: string
  type: JETypes
  memo?: string
  amount: number
}

export interface JERequestBody  {
  journalEntryLines: JournalEntryRequest[]
}

export type JournalEntryWithoutID =  Omit<JournalEntry, 'id'>

export type JournalEntryWithDate = JournalEntry & EntityDateWithDelete


export interface JournalEntryRequest {
  accountUUID: string
  departmentUUID?: string
  locationUUID?: string
  customerUUID?: string
  referenceCode?: string
  type: JETypes
  memo?: string
  amount: number
}

export type JournalEntryRequestWithUUID = JournalEntryRequest  & {
  uuid: string
}

export type JournalEntryResponse = Omit<JournalEntryWithDate, 'id'>

