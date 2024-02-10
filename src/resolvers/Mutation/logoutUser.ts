import { IContext } from 'types'
import { addToBlacklist } from '../../controller/redis/BlackList'

interface ILogoutResponse {
  message: string
}

export default async (
  _: never,
  __: never,
  context: IContext,
): Promise<ILogoutResponse> => {
  try {
    if (!context.user) {
      throw new Error('No token provided')
    }

    console.log(context.user)

    await addToBlacklist(context.user.jti)

    return { message: "You've been successfully logged out." }
  } catch (error) {
    console.error('Logout error:', error)
    throw new Error('Logout failed')
  }
}
