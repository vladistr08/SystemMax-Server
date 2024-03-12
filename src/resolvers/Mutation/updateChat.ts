import log from '../../components/log'
import { isValidUser } from '../../config/auth'
import { IContext } from 'types'
import { getChat, updateChatName } from '../../controller/dynamoDB/Chat'

interface IUpdateChatInput {
  chatId: string
  chatName: string
}

interface IUpdateChatResult {
  isUpdated: boolean
}

export default async (
  _: object,
  { input }: { input: IUpdateChatInput },
  context: IContext,
): Promise<IUpdateChatResult> => {
  try {
    const authResult = await isValidUser(context)
    if (!context.user || !authResult.isValid) {
      throw new Error(authResult.message)
    }

    const { chatId, chatName } = input

    if (!(await getChat({ chatId }))) {
      throw new Error(`No chat found to update for id ${chatId}`)
    }

    const isUpdated = await updateChatName({ chatId, chatName })

    return {
      isUpdated,
    }
  } catch (e) {
    log.error(`Error at addChat resolver, ${e.message}`)
    throw new Error(`Error at addChat resolver, ${e.message}`)
  }
}
