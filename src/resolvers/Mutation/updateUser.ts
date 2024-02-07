import UserDBClient from '../../dynamoDB/User'
import log from '../../components/log'
import { IContext } from 'types'

interface IUserUpdateInput {
  updates: {
    username?: string
    email?: string
    password?: string
    name?: string
  }
}

interface IUserUpdateResult {
  isUpdated: boolean
}

export default async (
  _: object,
  { input }: { input: IUserUpdateInput },
  { user }: IContext,
): Promise<IUserUpdateResult> => {
  console.log(user)
  if (!user) {
    throw new Error('Not authenticated')
  }
  try {
    const instance = UserDBClient.getInstance()

    const updateUserResult = await instance.updateUser({
      user_id: user.userId,
      updates: input.updates,
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
