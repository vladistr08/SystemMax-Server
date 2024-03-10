import log from '../../components/log'

interface IRemoveChatInput {
  chatId: string
}

interface IRemoveChatResult {
  isRemoved: boolean
}

export default async (
  _: object,
  { input }: { input: IRemoveChatInput },
): Promise<IRemoveChatResult> => {
  try {
    // TODO implement
  } catch (e) {
    log.error('Fail at remove chat resolver')
    throw new Error('Fail at remove chat resolver')
  }
}
