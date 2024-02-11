import { getAssistantResponse } from '../../controller/openai/Assistent'
import log from '../../components/log'
import { IContext } from 'types'
import { isValidUser } from '../../config/auth'

interface IGetAssistantResponseInput {
  message: string
}

interface IGetAssistantResponseResult {
  message: string
}

export default async (
  _: object,
  { input }: { input: IGetAssistantResponseInput },
  context: IContext,
): Promise<IGetAssistantResponseResult> => {
  try {
    const authResult = await isValidUser(context)
    if (!context.user || !authResult.isValid) {
      throw new Error(authResult.message)
    }

    return { message: await getAssistantResponse(input) }
  } catch (e) {
    log.error(`Error at getAssistantResponse Resolver: ${e.message}`)
    throw new Error(`Failed to get response from the assistant: ${e.message}`)
  }
}
