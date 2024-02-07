import { IUser } from '../../models/User'
import UserDBClient from '../../dynamoDB/User'
import log from '../../components/log'

interface ILoginInput {
  email: string
  password: string
}

interface ILoginResult {
  user: IUser | null
}

export default async (
  _: object,
  { input }: { input: ILoginInput },
): Promise<ILoginResult> => {
  try {
    const instance = UserDBClient.getInstance()
    const loginResult = await instance.loginUser({ ...input })

    if (!loginResult) {
      log.error('Failed to login user')
      return { user: null }
    }

    return { user: loginResult }
  } catch (e) {
    log.error(`Error at Login Resolver ${e.message}`)
    return { user: null }
  }
}
