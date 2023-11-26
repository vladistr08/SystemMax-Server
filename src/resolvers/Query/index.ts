import * as fs from 'fs'
import * as path from 'path'
import { IResolvers } from '@graphql-tools/utils'

/**
 * Create an object that contains every file from this directory as key
 *
 * @return {Object}
 */
const queries = fs
  .readdirSync(path.join(__dirname))
  .reduce((acc: IResolvers, fileName) => {
    if (
      fileName.startsWith('index') ||
      fileName.endsWith('.d.ts') ||
      fileName.endsWith('js.map')
    ) {
      return acc
    }
    const moduleName = fileName.substring(0, fileName.indexOf('.'))

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    acc[moduleName] = require(`./${fileName}`).default

    return acc
  }, {})

export default queries
