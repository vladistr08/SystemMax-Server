import { IUser } from '../../models/user'
import { loginUser } from '../../db/user'

interface ILoginInput {
  username: string
  password: string
}

interface ILoginResult {
  user: IUser | undefined
}

export default async (
  _: object,
  { input }: { input: ILoginInput },
): Promise<ILoginResult> => {
  try {
    const user = await loginUser({
      username: input.username,
      password: input.password,
    })
    return { user: user }
  } catch (e) {
    throw new Error(`Error at login resolver ${e.message}`)
  }
}
