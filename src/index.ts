import 'reflect-metadata';
import path from 'path';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import cors from 'cors';
import { createConnection } from 'typeorm';
import { User } from './entities/User';
import { MyContext } from './types';
import connectRedis from 'connect-redis';
import session from 'express-session';
import Redis from 'ioredis';
import { Photo } from './entities/Photo';
import { UserResolver } from './resolvers/user';
import { PhotoResolver } from './resolvers/photo';

const main = async () => {
  await createConnection({
    type: 'postgres',
    username: 'postgres',
    password: 'postgres',
    database: 'chwalinski',
    logging: true,
    synchronize: true,
    migrations: [path.join(__dirname, 'migrations/*')],
    entities: [User, Photo]
  });

  // await connection.runMigrations();
  
  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis();

  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    })
  );

  app.use(
    session({
      name: 'qid',
      store: new RedisStore({
        host: 'localhost',
        port: 6379,
        client: redis,
        disableTouch: false, // TODO - change to true later
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 2,
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
      },
      saveUninitialized: false,
      secret: 'ldjfalskdjadfj',
      resave: false,
    })
  )
 
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver, PhotoResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ req, res, redis })
  });

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(4000, () => {
    console.log('🚀 server launched on http://localhost:4000');
  });
};

main().catch(err => console.log(err));