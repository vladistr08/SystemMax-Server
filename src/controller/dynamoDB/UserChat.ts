import UserChatDBClient, { IChatID } from '../../components/dynamoDB/UserChat'
import log from '../../components/log'

interface ICreateChatRecordParams {
  userId: string
  chatId: string
}

export const createChatRecord = async (
  params: ICreateChatRecordParams,
): Promise<boolean> => {
  const userChatDBClient = UserChatDBClient.getInstance()
  try {
    const existingChats =
      (await userChatDBClient.getChatsByUserId(params.userId)) || []
    const chatExists = existingChats.some(
      (chat) => chat.chatId === params.chatId,
    )
    if (chatExists) {
      throw new Error(
        `Chat with ID ${params.chatId} already linked to user ${params.userId}`,
      )
    }

    const success = await userChatDBClient.createChatRecord(params)
    if (success) {
      return true
    } else {
      throw new Error('Failed to create chat record')
    }
  } catch (error) {
    log.error(`Error creating chat record: ${error.message}`)
    throw error
  }
}

export const getChatsByUserId = async (userId: string): Promise<IChatID[]> => {
  const userChatDBClient = UserChatDBClient.getInstance()
  try {
    const chatIds = await userChatDBClient.getChatsByUserId(userId)
    return chatIds || []
  } catch (error) {
    log.error(`Error retrieving chats for user ID ${userId}: ${error.message}`)
    throw error
  }
}

interface IDeleteChatRecordParams {
  chatId: string
}

export const deleteChatRecord = async ({
  chatId,
}: IDeleteChatRecordParams): Promise<boolean> => {
  try {
    const userChatDBClient = UserChatDBClient.getInstance()

    const success = await userChatDBClient.deleteChatRecord({ chatId })
    if (success) {
      log.info(
        `Successfully deleted chat record for user and chat ID: ${chatId}.`,
      )
      return true
    } else {
      throw new Error('Failed to delete chat record')
    }
  } catch (error) {
    log.error(
      `Error deleting chat record for user and chat ID ${chatId}: ${error.message}`,
    )
    throw error
  }
}
