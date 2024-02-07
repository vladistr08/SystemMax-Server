import { IUser } from '../../models/User'
import UserDBClient from '../../dynamoDB/User'
import log from '../../components/log'

interface IUserCreateInput {
  username: string
  email: string
  password: string
  name: string
}

interface IUserCreateResult {
  user: IUser | null
}

export default async (
  _: object,
  { input }: { input: IUserCreateInput },
): Promise<IUserCreateResult> => {
  const ResultEmptyObject = { user: null, token: null }
  try {
    const instance = UserDBClient.getInstance()

    const user_id = await instance.findUserIdByEmail(input.email)
    if (user_id) {
      log.error(`User already exists: ${input.email}`)
      return ResultEmptyObject
    }

    const registerResult = await instance.registerUser({ ...input })

    if (!registerResult) {
      log.error('User was no registered')
      return ResultEmptyObject
    }

    return { user: registerResult }
  } catch (e) {
    log.error(`Error at Register Resolver: ${e?.message}`)
    return ResultEmptyObject
  }
}
