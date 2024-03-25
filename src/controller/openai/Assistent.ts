import Assistant from '../../components/openai/Assistant'

interface IGetAssistantResponseInput {
  message: string
  messageId?: string
}

interface IGetAssistantResponseResult {
  response: string
  threadId: string
}

export const getAssistantResponse = async ({
  message,
  messageId,
}: IGetAssistantResponseInput): Promise<IGetAssistantResponseResult> => {
  try {
    const assistant = Assistant.getInstance()
    return await assistant.sendMessageAndGetResponse(message, messageId)
  } catch (e) {
    throw new Error(e)
  }
}

export const createThread = async (): Promise<string> => {
  try {
    const assistant = Assistant.getInstance()
    return await assistant.createThread()
  } catch (e) {
    throw new Error(e)
  }
}
