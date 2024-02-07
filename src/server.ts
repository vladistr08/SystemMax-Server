import * as express from 'express'
import * as bodyParser from 'body-parser'
import { ApolloServer } from 'apollo-server-express'
import log from './components/log'
import env from './config/env'
import apolloConfig from './config/apollo-server-config'
import * as jwt from 'jsonwebtoken'

const app: any = express()
app.use(bodyParser.json({ limit: '10mb' }))

app.use((req: express.Request, _: never, next) => {
  const authHeader: string = (req.headers && req.headers['authorization']) || ''

  try {
    req['user'] = jwt.verify(authHeader, env.JWT_SECRET_KEY)
    next()
  } catch (error) {
    log.error('JWT verification failed:', error)
  }
  next()
})

// configure apollo server
const server = new ApolloServer(apolloConfig)

server
  .start()
  .then(() => server.applyMiddleware({ app }))
  .then(() => app.listen({ port: env.PORT }))
  .then(() =>
    log.info(
      `🚀 Server listen at http://localhost:${env.PORT}${server.graphqlPath}`,
    ),
  )
