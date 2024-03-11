import log from '../../components/log'
import * as jwt from 'jsonwebtoken'
import env from '../../config/env'
import { v4 as uuidv4 } from 'uuid'
import { addToBlacklist } from '../../controller/redis/BlackList'
import { DecodedToken } from 'types'

interface IRefreshTokenInput {
  token: string
}

interface IRefreshTokenResult {
  token: string | null
}

export default async (
  _: object,
  { input }: { input: IRefreshTokenInput },
): Promise<IRefreshTokenResult> => {
  const ResultEmptyObject = { token: null }
  try {
    const user = jwt.verify(input.token, env.JWT_SECRET_KEY) as DecodedToken

    const newToken = jwt.sign(
      {
        userId: user.userId,
        email: user.email,
        name: user.name,
        username: user.username,
        jti: uuidv4(),
      },
      env.JWT_SECRET_KEY,
      { expiresIn: '1h' },
    )

    await addToBlacklist(user.jti)

    return { token: newToken }
  } catch (e) {
    log.error(`Error at Refresh token Resolver ${e.message}`)
    return ResultEmptyObject
  }
}
