import { EntityDateWithArchive } from '../types'

export interface Account extends EntityDateWithArchive {
  id: number
  internalID: number
  integrationID: number
  entityID: string
  accountNumber: string
  uuid: string
  label: string
  initialBalance: number
}

export interface AccountRequest  {
  internalID: number
  integrationID: number
  entityID: string
  parentID?: number
  accountNumber: string
  uuid: string
  label: string
  initialBalance: number
  currentBalance: number
  createdBy: string
  updatedBy: string
}

export interface QuickBookAccount {
    Name: string
    SubAccount: boolean
    ParentRef?: { value: string }
    FullyQualifiedName: string
    Active: boolean
    Classification: string
    AccountType: string
    AccountSubType: string
    CurrentBalance: number
    CurrentBalanceWithSubAccounts: number
    CurrencyRef: { value: string, name: string }
    domain: string
    sparse: boolean
    Id: string
    SyncToken: string
    MetaData: {
      CreateTime: string,
      LastUpdatedTime: string
    }
}
