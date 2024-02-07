import UserDBClient from '../../dynamoDB/User'
import log from '../../components/log'
import { IContext } from 'types'

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
  if (!context.user) {
    throw new Error('Not authenticated')
  }
  try {
    const instance = UserDBClient.getInstance()

    console.log(input)

    const updateUserResult = await instance.updateUser({
      user_id: context?.user.userId,
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
