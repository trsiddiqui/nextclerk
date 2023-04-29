export interface QuickbooksAuthTokenResponse {
  token: {
    access_token: string
    refresh_token: string
    expires_in: number
    x_refresh_token_expires_in: number
    createdAt: number
    token_type: 'bearer'
  }
}
