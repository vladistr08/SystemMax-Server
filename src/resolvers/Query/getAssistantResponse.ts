import { getAssistantResponse } from '../../controller/openai/Assistent'
import log from '../../components/log'
import { IContext } from 'types'
import { isValidUser } from '../../config/auth'
import { addMessage, getMessages } from '../../controller/dynamoDB/Message'
import { getChat } from '../../controller/dynamoDB/Chat'

interface IGetAssistantResponseInput {
  chatId: string
  message: string
}

interface IGetAssistantResponseResult {
  message: string
  chatId: string
}

export default async (
  _: object,
  { input }: { input: IGetAssistantResponseInput },
  context: IContext,
): Promise<IGetAssistantResponseResult> => {
  try {
    const { chatId, message } = input

    const authResult = await isValidUser(context)
    if (!context.user || !authResult.isValid) {
      throw new Error(authResult.message)
    }

    console.log({ chatIdMesssage: chatId })

    if (!(await getChat({ chatId }))) {
      throw new Error('Chat does not exist you hacker!')
    }

    const assistantMessage = await getAssistantResponse({
      message,
      messageId: chatId,
    })

    const threadId = assistantMessage.threadId

    const messages = await getMessages({ chatId: threadId })

    const lastMessageIndex =
      messages.length > 0
        ? Math.max(...messages.map((msg) => msg.messageIndex))
        : -1

    await addMessage({
      chatId: threadId,
      messageIndex: lastMessageIndex + 1,
      message: message,
    })

    await addMessage({
      chatId: threadId,
      messageIndex: lastMessageIndex + 2,
      message: assistantMessage.response,
    })

    return {
      message: assistantMessage.response,
      chatId: assistantMessage.threadId,
    }
  } catch (e) {
    log.error(`Error at getAssistantResponse Resolver: ${e.message}`)
    throw new Error(`Error at getAssistantResponse Resolver: ${e.message}`)
  }
}
