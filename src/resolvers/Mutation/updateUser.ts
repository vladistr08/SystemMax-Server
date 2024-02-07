import UserDBClient from '../../dynamoDB/User'
import log from '../../components/log'

interface IUserUpdateInput {
  email: string
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
): Promise<IUserUpdateResult> => {
  try {
    const instance = UserDBClient.getInstance()

    const user_id = await instance.findUserIdByEmail(input.email)
    if (!user_id) {
      log.error(`No user found for email: ${input.email}`)
      return { isUpdated: false }
    }
    const updateUserResult = await instance.updateUser({
      user_id,
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
