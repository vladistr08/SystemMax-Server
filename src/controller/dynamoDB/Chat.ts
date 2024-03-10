import ChatDB from '../../components/dynamoDB/Chat'
import log from '../../components/log'
import { IChat } from '../../components/dynamoDB/Chat'

interface ICreateChatParams {
  chatId: string
  createdAt: string
}

interface IGetChatParams {
  chatId: string
}

export const createChat = async ({
  chatId,
  createdAt,
}: ICreateChatParams): Promise<boolean> => {
  const chatDBClient = ChatDB.getInstance()
  try {
    const success = await chatDBClient.addChat({ chatId, createdAt })
    if (success) {
      return true
    } else {
      log.error('Failed to create chat record')
      return false
    }
  } catch (error) {
    log.error(`Error creating chat record: ${error.message}`)
    return false
  }
}

export const getChat = async ({
  chatId,
}: IGetChatParams): Promise<IChat | null> => {
  const chatDBClient = ChatDB.getInstance()
  try {
    const chat = await chatDBClient.getChat({ chatId })
    if (chat) {
      return chat
    } else {
      log.info('No chat found')
      return null
    }
  } catch (error) {
    log.error(`Error retrieving chat with ID ${chatId}: ${error.message}`)
    return null
  }
}