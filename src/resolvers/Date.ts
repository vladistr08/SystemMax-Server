/**
 * Created by Florin David on 05/12/2017.
 */
import { GraphQLScalarType } from 'graphql'
import { Kind } from 'graphql/language'

export default new GraphQLScalarType({
  description: 'Date custom scalar type',
  name: 'Date',

  parseValue(value): Date {
    if (typeof value === 'string' && value.length === 10) {
      return new Date(value) // value from the client
    }
    throw new Error('YYYY-MM-DD format expected')
  },
  serialize(value): string | null {
    if (value) {
      if (value instanceof Date) {
        return value.toISOString().substring(0, 10) // value sent to the client
      } else if (typeof value === 'string') {
        return new Date(Date.parse(value)).toISOString().substring(0, 10)
      }
    }
    return null
  },
  parseLiteral(ast): Date | null {
    if (ast.kind === Kind.STRING && ast.value && ast.value.length === 10) {
      return new Date(ast.value.substring(0, 10)) // ast value is always in string format
    }
    throw new Error('YYYY-MM-DD format expected')
  },
})
