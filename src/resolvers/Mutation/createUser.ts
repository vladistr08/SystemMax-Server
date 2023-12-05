import { createUser } from '../../db/user'
import { IUser } from '../../models/user'

interface IUserInput {
  username: string
  password: string
  email?: string
}

interface IUserResult {
  user: IUser | undefined
}

export default async (
  _: object,
  { input }: { input: IUserInput },
): Promise<IUserResult> => {
  try {
    return {
      user: await createUser({
        username: input.username,
        password: input.password,
        email: input?.email,
      }),
    }
  } catch (e) {
    throw new Error(`Resolver error creating user ${e.message}`)
  }
}
