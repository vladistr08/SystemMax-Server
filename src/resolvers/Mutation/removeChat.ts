import log from '../../components/log'
import { isValidUser } from '../../config/auth'
import { IContext } from 'types'
import { deleteChat, getChat } from '../../controller/dynamoDB/Chat'

interface IRemoveChatInput {
  chatId: string
}

interface IRemoveChatResult {
  isRemoved: boolean
}

export default async (
  _: object,
  { input }: { input: IRemoveChatInput },
  context: IContext,
): Promise<IRemoveChatResult> => {
  try {
    const authResult = await isValidUser(context)
    if (!context.user || !authResult.isValid) {
      throw new Error(authResult.message)
    }

    if (!(await getChat({ chatId: input.chatId }))) {
      log.error('Chat already exists')
      return { isRemoved: false }
    }

    const isRemoved = await deleteChat({ chatId: input.chatId })
    return { isRemoved }
  } catch (e) {
    log.error('Error at remove chat resolver')
    throw new Error('Error at remove chat resolver')
  }
}
