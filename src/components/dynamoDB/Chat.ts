import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb'
import env from '../../config/env'
import log from '../log'

interface AddChatParams {
  chatId: string
  createdAt: string
}

interface GetChatParams {
  chatId: string
}

export interface IChat {
  chatId: string
  createdAt: string
}

class ChatDB {
  private static instance: ChatDB
  private static client: DynamoDBDocumentClient

  private constructor() {
    if (!ChatDB.client) {
      const dynamoDBClient = new DynamoDBClient({})
      ChatDB.client = DynamoDBDocumentClient.from(dynamoDBClient)
    }
  }

  public static getInstance(): ChatDB {
    if (!ChatDB.instance) {
      ChatDB.instance = new ChatDB()
    }
    return ChatDB.instance
  }

  public async addChat({ chatId, createdAt }: AddChatParams): Promise<boolean> {
    try {
      await ChatDB.client.send(
        new PutCommand({
          TableName: env.DYNAMODB_CHAT_TABLE_NAME,
          Item: { chat_id: chatId, createdAt },
        }),
      )

      log.info(`Chat record created successfully for chat ID ${chatId}`)
      return true
    } catch (error) {
      log.error(`Error creating chat record for chat ID ${chatId}: ${error}`)
      return false
    }
  }

  public async getChat({ chatId }: GetChatParams): Promise<IChat | null> {
    try {
      const { Item } = await ChatDB.client.send(
        new GetCommand({
          TableName: env.DYNAMODB_CHAT_TABLE_NAME,
          Key: { chat_id: chatId },
        }),
      )

      if (Item) {
        log.info(`Chat retrieved successfully for chat ID ${chatId}`)
        return { chatId: Item.chatId, createdAt: Item.createdAt }
      } else {
        log.error(`No chat found with ID ${chatId}`)
        return null
      }
    } catch (error) {
      log.error(`Error retrieving chat with ID ${chatId}: ${error}`)
      return null
    }
  }
}

export default ChatDB
