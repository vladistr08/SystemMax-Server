import log from '../../components/log'
import { IContext } from 'types'
import { isValidUser } from '../../config/auth'
import { getChatsByUserId } from '../../controller/dynamoDB/UserChat'
import * as Bluebird from 'bluebird'
import { getChat } from '../../controller/dynamoDB/Chat'
import { IChat } from '../../components/dynamoDB/Chat'
interface IGetUserChatsResult {
  items: IChat[]
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

    const chatDataMapped: IChat[] = await Bluebird.mapSeries(
      getChatsResult,
      async ({ chatId }): Promise<IChat> => {
        const chatData = await getChat({ chatId })
        return {
          chatId,
          createdAt: chatData ? chatData.createdAt : 'no-data',
          chatName: chatData ? chatData.chatName : 'no-name',
        }
      },
    )

    return { items: chatDataMapped || [] }
  } catch (e) {
    log.error(`Error at getUserChatRecords Resolver: ${e?.message}`)
    throw new Error(`Error at getUserChatRecords Resolver: ${e?.message}`)
  }
}
