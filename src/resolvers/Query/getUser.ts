import { IUser } from '../../models/User'
import log from '../../components/log'
import { findUserByEmail, findUserById } from '../../controller/dynamoDB/User'

interface IGetUserInput {
  email?: string
  user_id?: string
}

interface IGetUserResult {
  user: IUser | null
}

export default async (
  _: object,
  { input }: { input: IGetUserInput },
): Promise<IGetUserResult> => {
  const { email, user_id } = input

  const findUser = async (): Promise<IUser | null> => {
    if (user_id) {
      const userById = await findUserById(user_id)

      if (userById) return userById

      if (email) return findUserByEmail(email)

      throw new Error('UserId provided but not found, and no email provided')
    } else if (email) {
      const userByEmail = await findUserByEmail(email)

      if (userByEmail) return userByEmail

      throw new Error('Cannot find user by email')
    }
    throw new Error('UserId or Email not provided')
  }

  try {
    const user = await findUser()
    return { user }
  } catch (e) {
    log.error(`Error at getUser Resolver ${e.message}`)
    return { user: null }
  }
}
