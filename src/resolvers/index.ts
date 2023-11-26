import * as fs from 'fs'
import * as path from 'path'
import { IResolvers } from '@graphql-tools/utils'

/**
 * Create an object that contains every file from this directory as key
 *
 * @return {Object}
 */
const resolvers = fs
  .readdirSync(path.join(__dirname))
  .reduce((acc: IResolvers, fileName) => {
    if (
      fileName.startsWith('index') ||
      fileName.endsWith('.d.ts') ||
      fileName.endsWith('js.map')
    ) {
      return acc
    }

    // test that we may have folders which doesn't have `.`
    const moduleName =
      fileName.indexOf('.') > 0
        ? fileName.substring(0, fileName.indexOf('.'))
        : fileName

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    acc[moduleName] = require(`./${fileName}`).default

    return acc
  }, {})

export default resolvers
