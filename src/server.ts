import * as express from 'express'
import * as bodyParser from 'body-parser'
import { ApolloServer } from 'apollo-server-express'
import { log } from './components/log'

import env from './config/env'

import apolloConfig from './config/apollo-server-config'

//import {connectToDatabase} from './db'

// configure express
const app = express()
app.use(bodyParser.json({ limit: '10mb' }))

app.use((_, __, next) => {
  next()
})

// configure apollo server
const server = new ApolloServer(apolloConfig)
server
  .start()
  .then(() => server.applyMiddleware({ app }))
  //.then(() => connectToDatabase())
  .then(() => app.listen({ port: env.PORT }))
  .then(() =>
    log.info(
      `🚀 Server listen at http://localhost:${env.PORT}${server.graphqlPath}`,
    ),
  )
