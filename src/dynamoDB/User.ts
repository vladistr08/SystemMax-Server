// DynamoDBClient.ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  QueryCommand,
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
  user_id: string
  password: string
}

interface IUserUpdateParams {
  user_id: string
  updates: Partial<IUserRegistrationParams>
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
    user_id,
    password,
  }: IUserLoginParams): Promise<IUser | null> {
    try {
      const { Item } = await UserDBClient.client.send(
        new GetCommand({
          TableName: env.DYNAMODB_USER_TABLE_NAME,
          Key: { user_id },
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

  public async findUserIdByEmail(email: string): Promise<string | null> {
    const params = {
      TableName: env.DYNAMODB_USER_TABLE_NAME,
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :emailVal',
      ExpressionAttributeValues: {
        ':emailVal': email,
      },
    }

    try {
      const data = await UserDBClient.client.send(new QueryCommand(params))
      if (data.Items && data.Items.length > 0) {
        return data.Items[0].user_id
      }
      return null
    } catch (error) {
      log.error('Error finding user ID by email:', error)
      return null
    }
  }

  public async updateUser({
    user_id,
    updates,
  }: IUserUpdateParams): Promise<boolean> {
    // Inițializarea expresiilor de update
    const updateExpressions: string[] = []
    const expressionAttributeValues: { [key: string]: string } = {}
    const expressionAttributeNames: { [key: string]: string } = {}

    // Adaugă condițiile de update bazate pe câmpurile furnizate în `updates`
    Object.keys(updates).forEach((key) => {
      const attributeKey = `#${key}`
      const attributeValue = `:${key}`

      updateExpressions.push(`${attributeKey} = ${attributeValue}`)
      expressionAttributeValues[attributeValue] = updates[key]
      expressionAttributeNames[attributeKey] = key
    })

    // Verifică dacă parola trebuie actualizată și hash-uiește noua parolă
    if (updates.password) {
      const passwordHash = await bcrypt.hash(updates.password, 12)
      updateExpressions.push('#passwordHash = :passwordHash')
      expressionAttributeValues[':passwordHash'] = passwordHash
      expressionAttributeNames['#passwordHash'] = 'passwordHash'
    }

    if (updateExpressions.length === 0) {
      log.error('No updates specified')
      return false
    }

    const params = {
      TableName: env.DYNAMODB_USER_TABLE_NAME,
      Key: { user_id },
      UpdateExpression: 'SET ' + updateExpressions.join(', '),
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
    }

    try {
      await UserDBClient.client.send(new UpdateCommand(params))
      log.info('User updated successfully')
      return true
    } catch (error) {
      log.error('Error updating user:', error)
      return false
    }
  }
}

export default UserDBClient
