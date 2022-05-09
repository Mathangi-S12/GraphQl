import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import Express from "express";
import { buildSchema, formatArgumentValidationError } from "type-graphql";
import { createConnection } from "typeorm";
import session from "express-session";
import connectRedis from "connect-redis";
declare module 'express-session' {
  export interface SessionData {
    user: { [key: string]: any };
  }
}

import { RegisterResolver } from "./modules/user/Register";
import { redis } from "./redis";
import { LoginResolver } from "./modules/user/Login";
import { MeResolver } from "./modules/user/Me";

const main = async () => {
  await createConnection();

  const schema = await buildSchema({
    resolvers: [MeResolver, RegisterResolver, LoginResolver]
  });

  const RedisStore = connectRedis(session);

  app.use(
    session({
      store: new RedisStore({
        client: redis as any
      }),
      name: "mmm",
      secret: "aslkdfjoiq12312",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7 * 365 // 7 years
      }
    })
  );
  
  const apolloServer = new ApolloServer({ schema, formatError: formatArgumentValidationError,
    context: ({ req }: any) => ({ req }) });
  const app = Express();
  apolloServer.start().then( ()=> {
    apolloServer.applyMiddleware({ app });
    app.listen({port :3000}, () => {
    console.log("Now browse to http://localhost:4000/graphql");
  });
})
};

main();