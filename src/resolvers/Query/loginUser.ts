import { IUser } from '../../models/User'
import UserDBClient from '../../dynamoDB/User'
import log from '../../components/log'

interface IUserLoginInput {
  email: string
  password: string
}

interface IUserLoginResult {
  user: IUser | null
}

export default async (
  _: object,
  { input }: { input: IUserLoginInput },
): Promise<IUserLoginResult> => {
  try {
    const instance = UserDBClient.getInstance()

    const user_id = await instance.findUserIdByEmail(input.email)

    if (!user_id) {
      log.error(`No user found for email ${input.email}`)
      return { user: null }
    }

    const loginResult = await instance.loginUser({
      user_id,
      password: input.password,
    })

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
