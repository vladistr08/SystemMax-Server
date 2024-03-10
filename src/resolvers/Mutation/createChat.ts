import log from '../../components/log'

interface ICreateChatInput {
  chatName: string
}

interface ICreateChatResult {
  chatId: string
  isCreated: boolean
}

export default async (
  _: object,
  { input }: { input: ICreateChatInput },
): Promise<ICreateChatResult> => {
  try {
    // createdAt will be Date.toISOString()
  } catch (e) {
    log.error('Error at addChat resolver')
    throw new Error(`Fail at addChat resolver, ${e?.message}`)
  }
}
