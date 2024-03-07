import log from '../../components/log'
import { IContext } from 'types'
import { updateUser } from '../../controller/dynamoDB/User'
import { isValidUser } from '../../config/auth'

interface IUserUpdateInput {
  username?: string
  email?: string
  password?: string
  name?: string
}

interface IUserUpdateResult {
  isUpdated: boolean
}

export default async (
  _: object,
  { input }: { input: IUserUpdateInput },
  context: IContext,
): Promise<IUserUpdateResult> => {
  try {
    const authResult = await isValidUser(context)
    if (!context.user || !authResult.isValid) {
      throw new Error(authResult.message)
    }

    const updateUserResult = await updateUser({
      userId: context.user.userId,
      updates: { ...input },
    })

    if (!updateUserResult) {
      log.error('User was not updated')
    }

    return { isUpdated: updateUserResult }
  } catch (e) {
    log.error(`Error at Update Resolver: ${e?.message}`)
    return { isUpdated: false }
  }
}
