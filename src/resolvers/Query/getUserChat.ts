import { IContext } from 'types' // Presupunem că ai acest tip definit undeva
import { isValidUser } from '../../config/auth'
import { getMessages } from '../../controller/dynamoDB/Message'
import log from '../../components/log'

interface IGetUserChatInput {
  chatId: string
  chatName?: string
}

interface IMessage {
  chatId: string
  messageIndex: number
  message: string
}

interface IGetUserChatResult {
  items: IMessage[]
}

export default async (
  _: object,
  { input }: { input: IGetUserChatInput },
  context: IContext,
): Promise<IGetUserChatResult> => {
  try {
    const authResult = await isValidUser(context)
    if (!context.user || !authResult.isValid) {
      throw new Error(authResult.message)
    }
    const messages = await getMessages({ messageId: input.chatId })
    if (!messages.length && input.chatName) {
      // TODO find by name
    }

    return {
      items: messages,
    }
  } catch (e) {
    log.error(`Error at getUserChat Resolver: ${e.message}`)
    throw new Error(`Error at getUserChat Resolver: ${e.message}`)
  }
}
