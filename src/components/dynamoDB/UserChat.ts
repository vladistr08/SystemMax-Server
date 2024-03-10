import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb'
import env from '../../config/env'
import log from '../log'

export interface IUserChat {
  userId: string
  chatId: string
}

export interface IChatID {
  chatId: string
  chatName: string
  timestamp: string
}

class UserChatDBClient {
  private static client: DynamoDBDocumentClient
  private static instance: UserChatDBClient

  private constructor() {
    const dynamoDBClient = new DynamoDBClient({})
    UserChatDBClient.client = DynamoDBDocumentClient.from(dynamoDBClient)
  }

  public static getInstance(): UserChatDBClient {
    if (!UserChatDBClient.instance) {
      UserChatDBClient.instance = new UserChatDBClient()
    }
    return UserChatDBClient.instance
  }

  public async getChatsByUserId(userId: string): Promise<IChatID[] | null> {
    try {
      const data = await UserChatDBClient.client.send(
        new ScanCommand({
          TableName: env.DYNAMODB_USER_CHAT_TABLE_NAME,
          FilterExpression: 'user_id = :userId',
          ExpressionAttributeValues: {
            ':userId': userId,
          },
        }),
      )

      if (data.Items) {
        return data.Items.map((item): IChatID => {
          return {
            chatId: item.chat_id,
            chatName: item.chat_name,
            timestamp: item.createdAt,
          }
        })
      }
      return null
    } catch (error) {
      log.error(`Error getting chats for user:${error?.message}`)
      return null
    }
  }

  public async createChatRecord({
    userId,
    chatId,
  }: IUserChat): Promise<boolean> {
    try {
      await UserChatDBClient.client.send(
        new PutCommand({
          TableName: env.DYNAMODB_USER_CHAT_TABLE_NAME,
          Item: { user_id: userId, chat_id: chatId },
        }),
      )

      return true
    } catch (error) {
      log.error(`Error creating chat record:${error?.message}`)
      return false
    }
  }
}

export default UserChatDBClient