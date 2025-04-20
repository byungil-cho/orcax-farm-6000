import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())

const server = new ApolloServer({ typeDefs, resolvers })
await server.start()
server.applyMiddleware({ app, path: '/graphql' })

app.listen(3001, () => {
  console.log('✅ Server is running on port 3001')
})
