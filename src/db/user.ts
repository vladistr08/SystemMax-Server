import { IUser, User } from '../models/user'
import * as bcrypt from 'bcrypt'

export const createUser = async (
  userData: IUser,
): Promise<IUser | undefined> => {
  try {
    const user = await User.find({ username: userData.username }).exec()
    if (user?.length) throw new Error('User already exists')

    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync(userData.password, salt)

    const hashData: IUser = { ...userData, password: hashedPassword }
    return await User.create(hashData)
  } catch (e) {
    console.log(`Error creating user ${e.message}`)
  }
}

export const loginUser = async ({
  username,
  password,
}: {
  username: string
  password: string
}): Promise<IUser | undefined> => {
  try {
    const user = await User.find({ username: username }).exec()
    if (!user?.length) return undefined

    const isValid = bcrypt.compareSync(password, user[0].password)
    if (!isValid) return undefined

    return user[0]
  } catch (e) {
    console.log(`Error while checking user ${e.message}`)
  }
}
