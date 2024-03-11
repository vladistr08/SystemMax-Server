import log from '../../components/log'
import { IContext } from 'types'
import { isValidUser } from '../../config/auth'
import { getChatsByUserId } from '../../controller/dynamoDB/UserChat'
import { IChatID } from '../../components/dynamoDB/UserChat'

interface IGetUserChatsResult {
  items: IChatID[]
}

export default async (
  _: object,
  __: never,
  context: IContext,
): Promise<IGetUserChatsResult> => {
  try {
    const authResult = await isValidUser(context)
    if (!context.user || !authResult.isValid) {
      throw new Error(authResult.message)
    }

    const getChatsResult = await getChatsByUserId(context.user.userId)
    console.log(getChatsResult)

    if (!getChatsResult.length) {
      log.error(`No chats found for userId: ${context.user.userId}`)
    }

    return { items: getChatsResult || [] }
  } catch (e) {
    log.error(`Error at getUserChatRecords Resolver: ${e?.message}`)
    throw new Error(`Error at getUserChatRecords Resolver: ${e?.message}`)
  }
}
