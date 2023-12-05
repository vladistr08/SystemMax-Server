import * as fs from 'fs'
import * as path from 'path'
import { gql } from 'apollo-server'
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core'

import resolvers from '../resolvers'

const typeDefs = gql(
  fs.readFileSync(path.join(__dirname, '../../schema.graphql'), 'utf8'),
)

export default {
  typeDefs,
  resolvers,
  introspection: true,
  tracingEnabled: true,
  playground: true,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
}
