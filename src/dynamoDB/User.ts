// DynamoDBClient.ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
} from '@aws-sdk/lib-dynamodb'
import * as bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import { IUser } from '../models/User'
import log from '../components/log'
import env from '../config/env'

interface IUserRegistrationParams {
  email: string
  password: string
  name: string
  username: string
}

interface IUserLoginParams {
  email: string
  password: string
}

class UserDBClient {
  private static client: DynamoDBDocumentClient
  private static instance: UserDBClient

  private constructor() {
    const dynamoDBClient = new DynamoDBClient({})
    UserDBClient.client = DynamoDBDocumentClient.from(dynamoDBClient)
  }

  public static getInstance(): UserDBClient {
    if (!UserDBClient.instance) {
      UserDBClient.instance = new UserDBClient()
    }
    return UserDBClient.instance
  }

  public async registerUser({
    email,
    password,
    username,
    name,
  }: IUserRegistrationParams): Promise<IUser | null> {
    const passwordHash = await bcrypt.hash(password, 12)

    const user: IUser = {
      user_id: uuidv4(),
      username,
      email,
      passwordHash: passwordHash,
      name,
      createdAt: new Date().toISOString().substring(0, 10),
    }

    try {
      await UserDBClient.client.send(
        new PutCommand({
          TableName: env.DYNAMODB_USER_TABLE_NAME,
          Item: user,
        }),
      )

      log.info('User registered successfully')

      return user
    } catch (error) {
      log.error(`Error registering user:${error?.message}`)
      return null
    }
  }

  public async loginUser({
    email,
    password,
  }: IUserLoginParams): Promise<IUser | null> {
    try {
      const { Item } = await UserDBClient.client.send(
        new GetCommand({
          TableName: env.DYNAMODB_USER_TABLE_NAME,
          Key: { email },
        }),
      )

      if (Item && (await bcrypt.compare(password, Item?.passwordHash))) {
        log.info('User logged in successfully')
        return Item as IUser
      } else {
        log.error('Invalid credentials')
        return null
      }
    } catch (error) {
      log.error('Error logging in user:', error)
      return null
    }
  }
}

export default UserDBClient
