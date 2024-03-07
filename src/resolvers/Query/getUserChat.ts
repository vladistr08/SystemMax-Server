import { IContext } from 'types' // Presupunem că ai acest tip definit undeva
import { isValidUser } from '../../config/auth'
import { getMessagesByChatId as getChatMessageLinks } from '../../controller/dynamoDB/ChatMessage'
import { getMessages } from '../../controller/dynamoDB/Message'
import log from '../../components/log'
import { getChatsByUserId } from '../../controller/dynamoDB/UserChat'

interface IGetUserChatInput {
  chatId: string
}

interface IMessage {
  messageId: string
  messageIndex: number
  message: string
}

interface IGetUserChatResult {
  items: IMessage[]
}

export const getUserChat = async (
  _: object,
  { chatId }: IGetUserChatInput,
  context: IContext,
): Promise<IGetUserChatResult> => {
  try {
    const authResult = await isValidUser(context)
    if (!context.user || !authResult.isValid) {
      throw new Error(authResult.message)
    }

    const userChatLink = await getChatsByUserId(context.user.userId)
    if (!userChatLink.length) {
      return { items: [] }
    }

    const chatMessageLinks = await getChatMessageLinks({ chatId })
    if (!chatMessageLinks.length) {
      return { items: [] }
    }

    const { messageId } = chatMessageLinks[0]

    const messages = await getMessages({ messageId })

    return {
      items: messages,
    }
  } catch (e) {
    log.error(`Error at getUserChat Resolver: ${e.message}`)
    throw new Error(`Failed to get chat messages: ${e.message}`)
  }
}
