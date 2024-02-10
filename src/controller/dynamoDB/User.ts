import UserDBClient from '../../components/dynamoDB/User'
import { IUser } from '../../models/User'
import log from '../../components/log'

interface IUserRegistrationParams {
  email: string
  password: string
  name: string
  username: string
}

interface IUserLoginParams {
  user_id: string
  password: string
}

interface IUserUpdateParams {
  user_id: string
  updates: Partial<IUserRegistrationParams>
}

const registerUser = async (
  params: IUserRegistrationParams,
): Promise<IUser | null> => {
  const userDBClient = UserDBClient.getInstance()
  try {
    return await userDBClient.registerUser(params)
  } catch (error) {
    log.error(`Error registering user: ${error.message}`)
    return null
  }
}

const loginUser = async (params: IUserLoginParams): Promise<IUser | null> => {
  const userDBClient = UserDBClient.getInstance()
  try {
    return await userDBClient.loginUser(params)
  } catch (error) {
    log.error(`Error logging in user: ${error.message}`)
    return null
  }
}

const findUserByEmail = async (email: string): Promise<IUser | null> => {
  const userDBClient = UserDBClient.getInstance()
  try {
    return await userDBClient.findUserByEmail(email)
  } catch (error) {
    log.error(`Error finding user by email: ${error.message}`)
    return null
  }
}

const findUserById = async (user_id: string): Promise<IUser | null> => {
  const userDBClient = UserDBClient.getInstance()
  try {
    return await userDBClient.findUserById(user_id)
  } catch (error) {
    log.error(`Error finding user by ID: ${error.message}`)
    return null
  }
}

const updateUser = async (params: IUserUpdateParams): Promise<boolean> => {
  const userDBClient = UserDBClient.getInstance()
  try {
    return await userDBClient.updateUser(params)
  } catch (error) {
    log.error(`Error updating user: ${error.message}`)
    return false
  }
}

export { registerUser, loginUser, findUserByEmail, findUserById, updateUser }
