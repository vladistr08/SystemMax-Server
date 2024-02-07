import { IUser } from '../../models/User'
import UserDBClient from '../../dynamoDB/User'
import log from '../../components/log'

interface IUserInput {
  username: string
  email: string
  password: string
  name: string
}

interface IUserResult {
  user: IUser | null
}

export default async (
  _: object,
  { input }: { input: IUserInput },
): Promise<IUserResult> => {
  try {
    const instance = UserDBClient.getInstance()
    const registerResult = await instance.registerUser({ ...input })

    if (!registerResult) {
      log.error('User was no registered')
      return { user: null }
    }

    return { user: registerResult }
  } catch (e) {
    log.error(`Error at Register Resolver: ${e?.message}`)
    return { user: null }
  }
}
