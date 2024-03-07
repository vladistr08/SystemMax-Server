import { getAssistantResponse } from '../../controller/openai/Assistent'
import log from '../../components/log'
import { IContext } from 'types'
import { isValidUser } from '../../config/auth'
import { addMessage, getMessages } from '../../controller/dynamoDB/Message' // Presupunând că ai modulele necesare
import { createChat } from '../../controller/dynamoDB/Chat'
import {
  addMessageToChat,
  getMessagesByChatId,
} from '../../controller/dynamoDB/ChatMessage'
import { createChatRecord } from '../../controller/dynamoDB/UserChat'
import { v4 as uuidv4 } from 'uuid'

interface IGetAssistantResponseInput {
  chatId?: string
  message: string
}

interface IGetAssistantResponseResult {
  message: string
  chatId: string
}

export default async (
  _: object,
  { chatId, message }: IGetAssistantResponseInput,
  context: IContext,
): Promise<IGetAssistantResponseResult> => {
  try {
    let chatIdVerified = chatId || ''
    const authResult = await isValidUser(context)
    if (!context.user || !authResult.isValid) {
      throw new Error(authResult.message)
    }

    const assistantMessage = await getAssistantResponse({ message })

    if (!chatId) {
      chatIdVerified = uuidv4()
      const createChatResult = await createChat({
        chatId: chatIdVerified,
        createdAt: new Date().toISOString(),
      })
      if (!createChatResult) {
        throw new Error('No chat was created')
      }
      await createChatRecord({
        chatId: chatIdVerified,
        userId: context.user.userId,
      })
    }

    const messagesLink = await getMessagesByChatId({ chatId: chatIdVerified })
    const messageId = messagesLink.length ? messagesLink[0].messageId : uuidv4()

    if (!messagesLink.length) {
      await addMessageToChat({ chatId: chatIdVerified, messageId })
    }

    const messages = await getMessages({ messageId })

    const lastMessageIndex =
      messages.length > 0
        ? Math.max(...messages.map((msg) => msg.messageIndex))
        : -1

    await addMessage({
      messageId: messageId,
      messageIndex: lastMessageIndex + 1,
      message: message,
    })

    await addMessage({
      messageId: messageId,
      messageIndex: lastMessageIndex + 2,
      message: assistantMessage,
    })

    return { message: assistantMessage, chatId: chatIdVerified }
  } catch (e) {
    log.error(`Error at getAssistantResponse Resolver: ${e.message}`)
    throw new Error(`Failed to get response from the assistant: ${e.message}`)
  }
}
