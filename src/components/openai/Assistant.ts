import { OpenAI } from 'openai'
import env from '../../config/env'
import log from '../log'
import { TextContentBlock } from 'openai/src/resources/beta/threads/messages/messages'

class Assistant {
  private static instance: Assistant
  private openAI: OpenAI

  private constructor() {
    this.openAI = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    })
    this.testConnection().catch((error) => {
      log.error('Failed to test connection in constructor:', error)
    })
  }

  public static getInstance(): Assistant {
    if (!Assistant.instance) {
      Assistant.instance = new Assistant()
    }
    return Assistant.instance
  }

  private async testConnection(): Promise<void> {
    try {
      const myAssistant = await this.openAI.beta.assistants.retrieve(
        env.OPENAI_ASSISTANT_ID,
      )

      log.info({ myAssistant })
    } catch (error) {
      log.error('Failed to connect to OpenAI and get assistant:', error)
    }
  }

  public async createThread(): Promise<string> {
    try {
      const thread = await this.openAI.beta.threads.create({})
      return thread.id
    } catch (e) {
      // Using `any` type to access custom properties like `message`
      log.error('Error while creating thread:', e)
      throw new Error(`Error while creating thread: ${e.message}`)
    }
  }

  private async pollForRunCompletion(
    threadId: string,
    runId: string,
  ): Promise<string> {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        const runStatus = await this.openAI.beta.threads.runs.retrieve(
          threadId,
          runId,
        )
        if (runStatus.status === 'completed') {
          const messages =
            await this.openAI.beta.threads.messages.list(threadId)
          const assistantMessage = messages.data.filter(
            (message) => message.role === 'assistant',
          )
          return assistantMessage
            ? (assistantMessage[0].content[0] as TextContentBlock).text.value
            : 'No response found.'
        } else if (runStatus.status === 'failed') {
          throw new Error('Run failed to complete.')
        }
        await new Promise((resolve) => setTimeout(resolve, 2000)) // Polling delay
      } catch (e) {
        log.error('Error during run completion polling:', e)
        throw e // Rethrow to break the loop and propagate the error
      }
    }
  }

  public async sendMessageAndGetResponse(
    userMessage: string,
    threadId?: string,
  ): Promise<{ response: string; threadId: string }> {
    let ensuredThreadId: string

    try {
      ensuredThreadId = threadId ? threadId : await this.createThread()

      await this.openAI.beta.threads.messages.create(ensuredThreadId, {
        role: 'user',
        content: userMessage,
      })

      const run = await this.openAI.beta.threads.runs.create(ensuredThreadId, {
        assistant_id: env.OPENAI_ASSISTANT_ID,
        model: 'gpt-3.5-turbo',
      })

      const assistantResponse = await this.pollForRunCompletion(
        ensuredThreadId,
        run.id,
      )

      return { response: assistantResponse, threadId: ensuredThreadId }
    } catch (e) {
      log.error('Error in sendMessageAndGetResponse:', e)
      throw new Error(`Error in sendMessageAndGetResponse: ${e.message}`)
    }
  }
}

export default Assistant
