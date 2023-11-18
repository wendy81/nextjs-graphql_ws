// import { createServer } from 'http'
// import {PubSub} from 'graphql-subscriptions'
// import { WebSocketServer } from 'ws'
// import { createYoga, createSchema } from 'graphql-yoga'
// import { useServer } from 'graphql-ws/lib/use/ws'
// import { parse } from 'url'
// import next from 'next'
// import mongoose from 'mongoose'
// import subscribes from './graphql/subscribe.js'

const { createServer } = require('http')
const { WebSocketServer } = require('ws')
const { useServer }  = require('graphql-ws/lib/use/ws')
const { parse }  = require('url')
const next  = require('next')
const mongoose  = require('mongoose')
const {logger} = require('logger')
const path = require('path')

// chatSchema
const chatSchemaFile = path.join(__dirname, '/graphql/chat/chatSchema.js');
const {chatSchema} = require(chatSchemaFile)
const commentSchemaFile = path.join(__dirname, '/graphql/comment/commentSchema.js');
const {commentSchema} = require(commentSchemaFile)

// const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_URI="mongodb://admin:m1Q6GY3pkVSlkCZS@ac-y48ujcb-shard-00-02.8y5lmma.mongodb.net:27017/nextjs?ssl=true&authSource=admin"

const  connDB = async function (){
    // 检查现有的MongoDB连接
    if (mongoose.connection.readyState === 1) {
        console.log('已经存在现有的MongoDB连接');
        // cookies().set('connection', 'connected')
    } else {
        console.log('尚未建立现有的MongoDB连接');
        // cookies().set('connection', 'noConnected')
        try {
            await mongoose.connect(MONGODB_URI,{
                useUnifiedTopology: true,
                // useFindAndModify: false,
                // useCreateIndex: true,
                useNewUrlParser: true,
                // serverSelectionTimeoutMS: 50000
              });
            //   cookies().set('connection', 'connecting')
        } catch (error) {
            console.log(error)
            // cookies().set('connection', 'connectErrow')
        }
        console.log(`已经存在现有的MongoDB连接${mongoose.connection.readyState}`);
    }
}


const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000
 
// prepare nextjs
const app = next({ dev, hostname, port })
 
// match the route next would use if yoga was in `pages/api/graphql.ts`
let graphqlEndpoint = null

// prepare yoga
;(async () => {
  await app.prepare()
  const handle = app.getRequestHandler()

  // create http server
  const server = createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const url = parse(req.url, true)
      /**
       * mutiple Schema, mutiple endpoint
       * 
       */
      if (url.pathname.includes('/api')) {
        if (url.pathname.startsWith('/api/graphql/chat')) {
          const yoga = await chatSchema('/api/graphql/chat')
          graphqlEndpoint = '/api/graphql/chat'
          await yoga(req, res)
        }
        if (url.pathname.startsWith('/api/graphql/comment')) {
          const yoga = await commentSchema('/api/graphql/comment')
          graphqlEndpoint = '/api/graphql/comment'
          await yoga(req, res)
        }
       
      } else {
        await handle(req, res, url)
      }
    } catch (err) {
      console.error(`Error while handling ${req.url}`, err)
      res.writeHead(500).end()
    }
  })
  
  // create websocket server
  const wsServer = new WebSocketServer({ server, path: '/api/graphql' })
 
  // prepare graphql-ws
  useServer(
    {
      execute: args => {
        console.log('execute')
        console.log(args)
        return args.rootValue.execute(args)
      },
      subscribe: args => {
        // console.log('subscribe')
        // console.log(args)
        const variables = args.variableValues
        // console.log(variables)
        if(variables.from){
          graphqlEndpoint = `/api/graphql/${variables.from}`
        }else{
          graphqlEndpoint = `/api/graphql/chat`
        }
        
        return args.rootValue.subscribe(args)
      },
      onSubscribe: async (ctx, msg) => {

        console.log('ctx ---- 99999999')
        console.log(ctx)
        console.log(msg)

        const yoga = graphqlEndpoint === '/api/graphql/chat' 
        ? await chatSchema('/api/graphql/chat') 
        : graphqlEndpoint === '/api/graphql/comment' 
        ? await commentSchema('/api/graphql/comment') 
        : await chatSchema('/api/graphql/chat')


        const { schema, execute, subscribe, contextFactory, parse, validate } = yoga.getEnveloped({
          ...ctx,
          req: ctx.extra.request,
          socket: ctx.extra.socket,
          params: msg.payload
        })

        const args = {
          schema,
          operationName: msg.payload.operationName,
          document: parse(msg.payload.query),
          variableValues: msg.payload.variables,
          contextValue: await contextFactory(),
          rootValue: {
            execute,
            subscribe
          }
        }
 
        const errors = validate(args.schema, args.document)
        if (errors.length) return errors
        return args
      },

    },
    wsServer
  )

  await connDB()
 
  await new Promise((resolve, reject) =>
    server.listen(port, err => (err ? reject(err) : resolve()))
  )
  
  console.log(`
> App started!
  HTTP server running on http://${hostname}:${port}
  GraphQL WebSocket server running on ws://${hostname}:${port}${graphqlEndpoint}
`)
})()

