import { EntityDateWithArchive } from '../types'

export interface Customer extends EntityDateWithArchive {
  id: number
  internalID: number
  integrationID: number
  entityID: string
  uuid: string
  label: string
  type: string | null
}

export interface CustomerRequest  {
  internalID: number
  integrationID: number
  entityID: string
  uuid: string
  label: string
  type: string | null
  createdBy: string
  updatedBy: string
}

export interface QuickBookCustomer {
  Taxable: boolean,
  BillAddr: {
    Id: string,
    Line1: string,
    City: string,
    CountrySubDivisionCode: string,
    PostalCode: string,
    Lat: string,
    Long: string
  },
  ShipAddr: {
    Id: string,
    Line1: string,
    City: string,
    CountrySubDivisionCode: string,
    PostalCode: string,
    Lat: string,
    Long: string
  },
  Job: boolean,
  BillWithParent: boolean,
  Balance: number,
  BalanceWithJobs: number,
  CurrencyRef: { value: string, name: string },
  PreferredDeliveryMethod: string,
  IsProject: boolean,
  ClientEntityId: string,
  domain: string,
  sparse: boolean,
  Id: string,
  SyncToken: string,
  MetaData: {
    CreateTime: string,
    LastUpdatedTime: string
  },
  GivenName: string,
  FamilyName: string,
  FullyQualifiedName: string,
  CompanyName: string,
  DisplayName: string,
  PrintOnCheckName: string,
  Active: boolean,
  V4IDPseudonym: string,
  PrimaryPhone: { FreeFormNumber: string },
  PrimaryEmailAddr: { Address: string }
}

export interface QuickBookVendor {
  Vendor1099: boolean,
  domain: string,
  DisplayName: string,
  SyncToken: number,
  PrintOnCheckName: string,
  sparse: boolean,
  Active: boolean,
  Balance: number,
  Id: string,
  MetaData: {
    CreateTime: string,
    LastUpdatedTime: string
  }
}

export interface QuickBookEmployee {
  SyncToken: number,
  domain: string,
  DisplayName: string,
  MiddleName: string,
  FamilyName: string,
  Active: boolean,
  PrintOnCheckName: string,
  sparse: boolean,
  BillableTime: boolean,
  GivenName: string,
  Id: string,
  MetaData: {
    CreateTime: string,
    LastUpdatedTime: string
  }
}
