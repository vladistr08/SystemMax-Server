export interface IContext {
  user?: DecodedToken | undefined
}

export interface DecodedToken {
  userId: string
  email: string
  username: string
  name: string
  iat: number
  exp: number
}
