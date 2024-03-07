import ChatMessageDBClient, {
  IChatMessageLink,
} from '../../components/dynamoDB/ChatMessage'
import log from '../../components/log'

interface IAddMessageToChatParams {
  chatId: string
  messageId: string
}

interface IGetMessagesByChatIdParams {
  chatId: string
}

export const addMessageToChat = async ({
  chatId,
  messageId,
}: IAddMessageToChatParams): Promise<boolean> => {
  const chatMessageDBClient = ChatMessageDBClient.getInstance()
  try {
    const existingMessages =
      (await chatMessageDBClient.getMessagesByChatId(chatId)) || []
    const messageExists = existingMessages.some(
      (msg) => msg.messageId === messageId,
    )
    if (messageExists) {
      throw new Error(
        `Message with ID ${messageId} already linked to chat ${chatId}`,
      )
    }

    const success = await chatMessageDBClient.linkMessageToChat({
      chatId,
      messageId,
    })
    if (success) {
      log.info('Message added to chat successfully')
      return true
    } else {
      throw new Error('Failed to add message to chat')
    }
  } catch (error) {
    log.error(`Error adding message to chat: ${error.message}`)
    throw error
  }
}

export const getMessagesByChatId = async ({
  chatId,
}: IGetMessagesByChatIdParams): Promise<IChatMessageLink[]> => {
  const chatMessageDBClient = ChatMessageDBClient.getInstance()
  try {
    const messages = await chatMessageDBClient.getMessagesByChatId(chatId)
    return messages || []
  } catch (error) {
    log.error(
      `Error retrieving messages for chat ID ${chatId}: ${error.message}`,
    )
    throw error
  }
}
