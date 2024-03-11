import MessageDB, { IMessage } from '../../components/dynamoDB/Message'
import log from '../../components/log'

interface IAddMessageParams {
  chatId: string
  messageIndex: number
  message: string
}

interface IGetMessageParams {
  chatId: string
}

export const addMessage = async ({
  chatId,
  messageIndex,
  message,
}: IAddMessageParams): Promise<boolean> => {
  const messageDBClient = MessageDB.getInstance()
  try {
    const success = await messageDBClient.addMessage({
      chatId,
      messageIndex,
      message,
    })
    if (success) {
      return true
    } else {
      log.error(`Failed to add message with ID: ${chatId}`)
      return false
    }
  } catch (error) {
    log.error(`Error adding message with ID ${chatId}: ${error.message}`)
    return false
  }
}

export const getMessages = async ({
  chatId,
}: IGetMessageParams): Promise<IMessage[]> => {
  const messageDBClient = MessageDB.getInstance()
  try {
    const messages = await messageDBClient.getMessages({ chatId })
    return messages || []
  } catch (error) {
    log.error(`Error retrieving message with ID ${chatId}: ${error.message}`)
    return []
  }
}

//TODO add delete

//TODO getMessagesByChatName
