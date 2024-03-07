import MessageDB, { IMessage } from '../../components/dynamoDB/Message'
import log from '../../components/log'

interface IAddMessageParams {
  messageId: string
  messageIndex: number
  message: string
}

interface IGetMessageParams {
  messageId: string
}

export const addMessage = async ({
  messageId,
  messageIndex,
  message,
}: IAddMessageParams): Promise<boolean> => {
  const messageDBClient = MessageDB.getInstance()
  try {
    const success = await messageDBClient.addMessage({
      messageId,
      messageIndex,
      message,
    })
    if (success) {
      return true
    } else {
      log.error(`Failed to add message with ID: ${messageId}`)
      return false
    }
  } catch (error) {
    log.error(`Error adding message with ID ${messageId}: ${error.message}`)
    return false
  }
}

export const getMessages = async ({
  messageId,
}: IGetMessageParams): Promise<IMessage[]> => {
  const messageDBClient = MessageDB.getInstance()
  try {
    const messages = await messageDBClient.getMessages({ messageId })
    return messages || []
  } catch (error) {
    log.error(`Error retrieving message with ID ${messageId}: ${error.message}`)
    return []
  }
}
