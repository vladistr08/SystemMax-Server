import log from '../../components/log'
import { isValidUser } from '../../config/auth'
import { IContext } from 'types'
import { deleteChat } from '../../controller/dynamoDB/Chat'
import { deleteChatRecord } from '../../controller/dynamoDB/UserChat'
import { deleteMessages } from '../../controller/dynamoDB/Message'

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

    const isRemoved = await deleteChat({ chatId: input.chatId })
    if (!isRemoved) {
      log.error('Cannot delete chat')
      return {
        isRemoved: false,
      }
    }

    const isRemovedLink = await deleteChatRecord({ chatId: input.chatId })
    if (!isRemovedLink) {
      log.error('Cannot delete chat link')
      return {
        isRemoved: false,
      }
    }

    const isRemovedMessage = await deleteMessages({ chatId: input.chatId })
    if (!isRemovedMessage) {
      log.error('Cannot delete messages')
      return {
        isRemoved: false,
      }
    }
    return { isRemoved: isRemoved && isRemovedLink && isRemovedMessage }
  } catch (e) {
    log.error('Error at remove chat resolver')
    throw new Error('Error at remove chat resolver')
  }
}
