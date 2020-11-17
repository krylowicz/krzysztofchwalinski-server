import 'reflect-metadata';
import path from 'path';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import cors from 'cors';
import { createConnection } from 'typeorm';
import { User } from './entities/User';
import { HelloResolver } from './resolvers/hello';
import { MyContext } from './types';

const main = async () => {
  const connection = await createConnection({
    type: 'postgres',
    username: 'postgres',
    password: 'postgres',
    database: 'chwalinski',
    logging: true,
    synchronize: true,
    migrations: [path.join(__dirname, 'migrations/*')],
    entities: [User]
  });

  // await connection.runMigrations();
  
  const app = express();

  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ req, res })
  });

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(4000, () => {
    console.log('🚀 server launched on http://localhost:4000');
  });
};

main().catch(err => console.log(err));