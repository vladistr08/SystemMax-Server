import { GraphQLScalarType } from 'graphql'
import { Kind } from 'graphql/language'

export default new GraphQLScalarType({
  description: 'Date custom scalar type',
  name: 'DateTime',

  parseValue(value): Date {
    if (typeof value === 'string') {
      return new Date(value) // value from the client
    }
    throw new Error('YYYY-MM-DD format expected')
  },
  serialize(value): string | null {
    if (value) {
      if (value instanceof Date) {
        return value.toISOString() // value sent to the client
      } else if (typeof value === 'string') {
        // get the first 10 chars if it matches the string
        const tokens = value.match(
          /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z)/,
        )
        if (tokens && tokens.length) {
          return tokens[0]
        }
      }
    }
    return null
  },
  parseLiteral(ast): Date | null {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value) // ast value is always in string format
    }
    return null
  },
})
