import { IUser } from '../../models/User'
import log from '../../components/log'
import * as jwt from 'jsonwebtoken'
import env from '../../config/env'
import { findUserByEmail, loginUser } from '../../controller/dynamoDB/User'
import { v4 as uuidv4 } from 'uuid'

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
    const user = await findUserByEmail(input.email)

    const user_id = user?.user_id ?? ''

    if (!user_id.length) {
      log.error(`No user found for email ${input.email}`)
      return ResultEmptyObject
    }

    const loginResult = await loginUser({
      userId: user_id,
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
        jti: uuidv4(),
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
