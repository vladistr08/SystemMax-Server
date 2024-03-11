import log from '../../components/log'
import { isValidUser } from '../../config/auth'
import { IContext } from 'types'
import { deleteChat } from '../../controller/dynamoDB/Chat'

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
      throw new Error('Cannot delete chat')
    }

    // const isRemovedLink = await deleteChatRecord({ chatId: input.chatId })
    // if (!isRemovedLink) {
    //   throw new Error('Cannot delete chat link')
    // }
    //
    // const isRemovedMessage = await deleteMessage({ chatId: input.chatId })
    // if (!isRemovedMessage) {
    //   throw new Error('Cannot delete messages')
    // }
    return { isRemoved: isRemoved }
    // return { isRemoved: isRemoved && isRemovedLink && isRemovedMessage }
  } catch (e) {
    log.error('Error at remove chat resolver')
    throw new Error('Error at remove chat resolver')
  }
}
