import { IUser } from '../../models/User'
import log from '../../components/log'
import { findUserByEmail, registerUser } from '../../controller/dynamoDB/User'

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
    const user_id = await findUserByEmail(input.email)
    if (user_id) {
      log.error(`User already exists: ${input.email}`)
      return ResultEmptyObject
    }

    const registerResult = await registerUser({ ...input })

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
