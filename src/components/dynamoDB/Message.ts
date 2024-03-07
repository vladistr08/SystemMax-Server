import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb'
import env from '../../config/env'
import log from '../log'
import { v4 as uuidv4 } from 'uuid'

interface AddMessageParams {
  messageId: string
  messageIndex: number
  message: string
}

interface GetMessageParams {
  messageId: string
}

export interface IMessage {
  messageId: string
  messageIndex: number
  message: string
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
    messageId,
    messageIndex,
    message,
  }: AddMessageParams): Promise<boolean> {
    try {
      await MessageDB.client.send(
        new PutCommand({
          TableName: env.DYNAMODB_MESSAGE_TABLE_NAME,
          Item: {
            message_UUID: uuidv4(),
            message_id: messageId,
            message_index: messageIndex,
            message,
          },
        }),
      )

      return true
    } catch (error) {
      log.error(
        `Error adding message with ID: ${messageId} and Index: ${messageIndex}: ${error}`,
      )
      return false
    }
  }

  public async getMessages({
    messageId,
  }: GetMessageParams): Promise<IMessage[] | null> {
    try {
      const { Items } = await MessageDB.client.send(
        new ScanCommand({
          TableName: env.DYNAMODB_MESSAGE_TABLE_NAME,
          FilterExpression: 'message_id = :messageId',
          ExpressionAttributeValues: {
            ':messageId': messageId,
          },
        }),
      )

      if (Items) {
        return Items.map((item) => ({
          messageId: item.message_id,
          messageIndex: item.message_index,
          message: item.message,
        })) as IMessage[]
      } else {
        log.info(`No messages found with ID: ${messageId}`)
        return null
      }
    } catch (error) {
      log.error(`Error retrieving messages with ID: ${messageId}: ${error}`)
      return null
    }
  }
}

export default MessageDB
