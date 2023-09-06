import cors from 'cors';
import express from 'express';
import { authMiddleware, handleLogin } from './auth.js';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware as apolloMiddleware } from '@apollo/server/express4';
import { readFile } from "fs/promises";
import { resolvers } from './resolvers.js';
import { log } from 'console';
import { getUser } from './db/users.js';

const HOST = 'http://localhost'
const PORT = 9000;

const app = express();
app.use(cors(), express.json(), authMiddleware);

const typeDefs = await readFile('./schema.graphql', 'utf-8');

async function getContext({ req: { auth } }) {
  if (auth) {
    const user = await getUser(auth.sub)
    return { user }
  }
  return {}
}

const apollo = new ApolloServer({ typeDefs, resolvers });
await apollo.start();

app.use('/graphql', apolloMiddleware(apollo, { context: getContext }));

app.post('/login', handleLogin);

app.listen({ port: PORT }, () => {
  log(`Server running on port ${HOST}:${PORT}`);
  log(`GraphQL server is running on  ${HOST}:${PORT}/graphql`)
});

