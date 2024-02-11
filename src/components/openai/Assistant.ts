import { OpenAI } from 'openai'
import env from '../../config/env'

class Assistant {
  private static instance: Assistant
  private openAI: OpenAI

  private constructor() {
    const configuration = {
      apiKey: env.OPENAI_API_KEY,
    }
    this.openAI = new OpenAI(configuration)
  }

  public static getInstance(): Assistant {
    if (!Assistant.instance) {
      Assistant.instance = new Assistant()
    }
    return Assistant.instance
  }

  public async getResponse(message: string): Promise<string> {
    try {
      const response = await this.openAI.chat.completions.create({
        messages: [{ role: 'system', content: message }],
        model: 'gpt-3.5-turbo',
      })
      console.log(response)
      return response.choices[0].message.content ?? 'NO RESPONSE'
    } catch (e) {
      throw new Error(`Error at getting OpenAI Response: ${e?.message}`)
    }
  }
}

export default Assistant
