import Assistant from '../../components/openai/Assistant'

interface IGetAssistantResponse {
  message: string
}

export const getAssistantResponse = async ({
  message,
}: IGetAssistantResponse): Promise<string> => {
  try {
    const assistant = Assistant.getInstance()
    return await assistant.getResponse(message)
  } catch (e) {
    throw new Error(e)
  }
}
