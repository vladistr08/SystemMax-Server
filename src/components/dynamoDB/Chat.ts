import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'
import env from '../../config/env'
import log from '../log'

interface AddChatParams {
  chatId: string
  createdAt: string
  chatName: string
}

interface GetChatParams {
  chatId: string
}

export interface IChat {
  chatId: string
  createdAt: string
  chatName: string
}

interface DeleteChatParams {
  chatId: string
}

interface UpdateChatNameParams {
  chatId: string
  chatName: string
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

  public async deleteChat({ chatId }: DeleteChatParams): Promise<boolean> {
    try {
      await ChatDB.client.send(
        new DeleteCommand({
          TableName: env.DYNAMODB_CHAT_TABLE_NAME,
          Key: { chat_id: chatId },
        }),
      )

      return true
    } catch (error) {
      log.error(`Error deleting chat record for chat ID ${chatId}: ${error}`)
      return false
    }
  }

  public async addChat({
    chatId,
    createdAt,
    chatName,
  }: AddChatParams): Promise<boolean> {
    try {
      await ChatDB.client.send(
        new PutCommand({
          TableName: env.DYNAMODB_CHAT_TABLE_NAME,
          Item: { chat_id: chatId, createdAt, chat_name: chatName },
        }),
      )

      return true
    } catch (error) {
      log.error(`Error creating chat record for chat ID ${chatId}: ${error}`)
      return false
    }
  }

  public async getChat({ chatId }: GetChatParams): Promise<IChat | null> {
    try {
      const { Items } = await ChatDB.client.send(
        new QueryCommand({
          TableName: env.DYNAMODB_CHAT_TABLE_NAME,
          KeyConditionExpression: 'chat_id = :chatId',
          ExpressionAttributeValues: {
            ':chatId': chatId,
          },
        }),
      )

      if (Items && Items.length > 0) {
        return {
          chatId: Items[0].chat_id,
          chatName: Items[0].chat_name,
          createdAt: Items[0].createdAt,
        }
      } else {
        log.error(`No chat found with ID ${chatId}`)
        return null
      }
    } catch (error) {
      log.error(`Error retrieving chat with ID ${chatId}: ${error}`)
      return null
    }
  }

  public async updateChatName({
    chatId,
    chatName,
  }: UpdateChatNameParams): Promise<boolean> {
    try {
      await ChatDB.client.send(
        new UpdateCommand({
          TableName: env.DYNAMODB_CHAT_TABLE_NAME,
          Key: { chat_id: chatId },
          UpdateExpression: 'set chat_name = :chatName',
          ExpressionAttributeValues: {
            ':chatName': chatName,
          },
        }),
      )

      return true
    } catch (error) {
      log.error(`Error updating chat name for chat ID ${chatId}: ${error}`)
      return false
    }
  }
}

export default ChatDB
