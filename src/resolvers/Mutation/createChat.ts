import log from '../../components/log'
import { createChatRecord } from '../../controller/dynamoDB/UserChat'
import { isValidUser } from '../../config/auth'
import { IContext } from 'types'
import { createChat, getChat, deleteChat } from '../../controller/dynamoDB/Chat'
import { createThread } from '../../controller/openai/Assistent'

interface ICreateChatInput {
  chatName: string
}

interface ICreateChatResult {
  chatId: string
  isCreated: boolean
}

export default async (
  _: object,
  { input }: { input: ICreateChatInput },
  context: IContext,
): Promise<ICreateChatResult> => {
  try {
    const authResult = await isValidUser(context)
    if (!context.user || !authResult.isValid) {
      throw new Error(authResult.message)
    }
    const chatId = await createThread()

    if (await getChat({ chatId })) {
      return {
        chatId,
        isCreated: false,
      }
    }

    const chatIsCreated = await createChat({
      chatId,
      createdAt: new Date().toISOString(),
      chatName: input.chatName,
    })

    if (!chatIsCreated) {
      throw new Error('Cannot create chat for user: ')
    }

    const chatRecordIsCreated = await createChatRecord({
      chatId,
      userId: context.user.userId,
    })

    if (!chatRecordIsCreated) {
      await deleteChat({ chatId })
      throw new Error(
        `Cannot create chat record for user: ${context.user.userId}`,
      )
    }

    return {
      chatId,
      isCreated: true,
    }
  } catch (e) {
    log.error(`Error at addChat resolver, ${e.message}`)
    throw new Error(`Error at addChat resolver, ${e.message}`)
  }
}
