import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb'
import env from '../../config/env'
import log from '../log'
import { v4 as uuidv4 } from 'uuid'

interface AddMessageParams {
  chatId: string
  messageIndex: number
  message: string
}

interface GetMessageParams {
  chatId: string
}

export interface IMessage {
  chatId: string
  messageIndex: number
  message: string
}

interface DeleteMessageParams {
  chatId: string
}

class MessageDB {
  private static instance: MessageDB
  private static client: DynamoDBDocumentClient

  private constructor() {
    if (!MessageDB.client) {
      const dynamoDBClient = new DynamoDBClient({})
      MessageDB.client = DynamoDBDocumentClient.from(dynamoDBClient)
    }
  }

  public static getInstance(): MessageDB {
    if (!MessageDB.instance) {
      MessageDB.instance = new MessageDB()
    }
    return MessageDB.instance
  }

  public async addMessage({
    chatId,
    messageIndex,
    message,
  }: AddMessageParams): Promise<boolean> {
    try {
      await MessageDB.client.send(
        new PutCommand({
          TableName: env.DYNAMODB_MESSAGE_TABLE_NAME,
          Item: {
            message_id: uuidv4(),
            chat_id: chatId,
            message_index: messageIndex,
            message,
          },
        }),
      )

      return true
    } catch (error) {
      log.error(
        `Error adding message with ID: ${chatId} and Index: ${messageIndex}: ${error}`,
      )
      return false
    }
  }

  //TODO getMessagesByName

  public async deleteMessagesByChatId({
    chatId,
  }: DeleteMessageParams): Promise<boolean> {
    try {
      const { Items } = await MessageDB.client.send(
        new ScanCommand({
          TableName: env.DYNAMODB_MESSAGE_TABLE_NAME,
          FilterExpression: 'chat_id = :chatId',
          ExpressionAttributeValues: {
            ':chatId': chatId,
          },
        }),
      )

      if (!Items) {
        log.info(`No messages found for chat ID: ${chatId}`)
        return false
      }

      for (const item of Items) {
        await MessageDB.client.send(
          new DeleteCommand({
            TableName: env.DYNAMODB_MESSAGE_TABLE_NAME,
            Key: {
              message_id: item.message_id,
            },
          }),
        )
      }

      return true
    } catch (error) {
      log.error(`Error deleting messages for chat ID ${chatId}: ${error}`)
      return false
    }
  }

  public async getMessages({
    chatId,
  }: GetMessageParams): Promise<IMessage[] | null> {
    try {
      const { Items } = await MessageDB.client.send(
        new ScanCommand({
          TableName: env.DYNAMODB_MESSAGE_TABLE_NAME,
          FilterExpression: 'chat_id = :chatId',
          ExpressionAttributeValues: {
            ':chatId': chatId,
          },
        }),
      )

      if (Items) {
        return Items.map((item) => ({
          chatId: item.chat_id,
          messageIndex: item.message_index,
          message: item.message,
        })) as IMessage[]
      } else {
        log.info(`No messages found with ID: ${chatId}`)
        return null
      }
    } catch (error) {
      log.error(`Error retrieving messages with ID: ${chatId}: ${error}`)
      return null
    }
  }
}

export default MessageDB
