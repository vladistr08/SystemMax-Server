import { IUser } from '../../models/User'
import UserDBClient from '../../dynamoDB/User'
import log from '../../components/log'
import * as jwt from 'jsonwebtoken'
import env from '../../config/env'

interface IUserLoginInput {
  email: string
  password: string
}

interface IUserLoginResult {
  user: IUser | null
  token: string | null
}

export default async (
  _: object,
  { input }: { input: IUserLoginInput },
): Promise<IUserLoginResult> => {
  const ResultEmptyObject = { user: null, token: null }
  try {
    const instance = UserDBClient.getInstance()

    const user_id = await instance.findUserIdByEmail(input.email)

    if (!user_id) {
      log.error(`No user found for email ${input.email}`)
      return ResultEmptyObject
    }

    const loginResult = await instance.loginUser({
      user_id,
      password: input.password,
    })

    if (!loginResult) {
      log.error('Failed to login user')
      return ResultEmptyObject
    }

    const token = jwt.sign(
      {
        userId: loginResult.user_id,
        email: loginResult.email,
        name: loginResult.name,
        username: loginResult.username,
      },
      env.JWT_SECRET_KEY,
      { expiresIn: '1h' },
    )

    return { user: loginResult, token }
  } catch (e) {
    log.error(`Error at Login Resolver ${e.message}`)
    return ResultEmptyObject
  }
}
