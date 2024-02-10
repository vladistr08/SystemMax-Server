import { IContext } from 'types'
import { isBlacklisted } from '../controller/redis/BlackList'

interface IIsValidUserResult {
  isValid: boolean
  message: string
}

export const isValidUser = async (
  context: IContext,
): Promise<IIsValidUserResult> => {
  if (!context.user) {
    return { isValid: false, message: 'Not authenticated' }
  }
  if (await isBlacklisted(context.user.jti)) {
    return { isValid: false, message: 'User Blacklisted' }
  }
  return { isValid: true, message: '' }
}
