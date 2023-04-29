export interface CustomerAuthDetails {
  entityUuid: string
  clientID: string
  clientSecret: string
  applicationID?: string
  refreshToken?: string
  refreshTokenExpiry?: Date
}
