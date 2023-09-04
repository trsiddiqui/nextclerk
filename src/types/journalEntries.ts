import { EntityDateWithDelete } from "./common"


export interface JournalEntry {
  id: number
  uuid: string
  supportingPackageID: number
  accountID: number
  departmentID?: number
  locationID?: number
  customerID?: number
  referenceCode?: string
  memo?: string
  cellLink?: string
  debitAmount: number
  creditAmount: number

}


export type JournalEntryWithoutID =  Omit<JournalEntry, 'id'>

export type JournalEntryWithDate = JournalEntry & EntityDateWithDelete


export interface JournalEntryRequest {
  uuid?: string
  accountUUID: string
  departmentUUID?: string
  locationUUID?: string
  customerUUID?: string
  referenceCode?: string
  memo?: string
  cellLink?: string
  debitAmount: number
  creditAmount: number
}


export type JournalEntryResponse = Omit<JournalEntryWithDate, 'id'>


export interface QBJournalEntryLine {
  JournalEntryLineDetail: {
    PostingType: string,
    AccountRef: {
      name: string,
      value: string
    }
  },
  DetailType: string,
  Amount: number,
  Id?: string,
  Description: string
}

export interface QBJournalEntryLines  {
  Line: QBJournalEntryLine[]
}

