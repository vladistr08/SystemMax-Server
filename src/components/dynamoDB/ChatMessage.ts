import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb'
import env from '../../config/env'
import log from '../log'

export interface IChatMessageLink {
  chatId: string
  messageId: string
}

class ChatMessageDBClient {
  private static client: DynamoDBDocumentClient
  private static instance: ChatMessageDBClient

  private constructor() {
    const dynamoDBClient = new DynamoDBClient({})
    ChatMessageDBClient.client = DynamoDBDocumentClient.from(dynamoDBClient)
  }

  public static getInstance(): ChatMessageDBClient {
    if (!ChatMessageDBClient.instance) {
      ChatMessageDBClient.instance = new ChatMessageDBClient()
    }
    return ChatMessageDBClient.instance
  }

  public async linkMessageToChat({
    chatId,
    messageId,
  }: IChatMessageLink): Promise<boolean> {
    try {
      await ChatMessageDBClient.client.send(
        new PutCommand({
          TableName: env.DYNAMODB_CHAT_MESSAGE_LINK_TABLE_NAME,
          Item: { chat_id: chatId, message_id: messageId },
        }),
      )

      log.info(
        `Link created successfully between chat ID ${chatId} and message ID ${messageId}`,
      )
      return true
    } catch (error) {
      log.error(
        `Error creating link between chat ID ${chatId} and message ID ${messageId}: ${error}`,
      )
      return false
    }
  }

  public async getMessagesByChatId(
    chatId: string,
  ): Promise<IChatMessageLink[] | null> {
    try {
      const { Items } = await ChatMessageDBClient.client.send(
        new QueryCommand({
          TableName: env.DYNAMODB_CHAT_MESSAGE_LINK_TABLE_NAME,
          KeyConditionExpression: 'chat_id = :chatId',
          ExpressionAttributeValues: {
            ':chatId': chatId,
          },
        }),
      )

      if (Items) {
        return Items.map((item) => ({
          chatId: item.chat_id,
          messageId: item.message_id,
        }))
      }
      return null
    } catch (error) {
      log.error(`Error retrieving messages for chat ID ${chatId}: ${error}`)
      return null
    }
  }
}

export default ChatMessageDBClient
