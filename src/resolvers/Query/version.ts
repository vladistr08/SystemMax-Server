// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require('../../../package.json')

export default async (): Promise<string> => {
  return version
}
