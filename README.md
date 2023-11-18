# nextjs-Pages_router-graphql_ws


::: tip

#### nextjs-Pages_router-graphql_ws

::: Tip

1. nextjs APP router does not support graphql-ws??, install nextjs page router
2. install nexjt, and select page router
* npx create-next-app@latest / yarn create next-app / pnpm create next-app
3. install graphql  graphql-ws、ws etc.  which we need modules


::::

### create server.js
* server.js exists nextjs page router's root directory
* use "new ApolloClient" Directional composition by client to select different api
["new ApolloClient" Directional composition"](https://www.apollographql.com/docs/react/api/link/introduction/#handling-a-response)


```js{20,74,109,119}
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


// connect mmongodb
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
      // This place we should process when to use api-chat/api-comment, use "new ApolloClient" Directional composition
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

        // console.log('ctx ---- 99999999')
        // console.log(ctx)
        // console.log(msg)

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

 ```
::: warning
#### 1. we will use "new ApolloClient" Directional composition by client to select different api
["new ApolloClient" Directional composition](https://www.apollographql.com/docs/react/api/link/introduction/#handling-a-response)
```js{11-20}
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
```

#### 2. different subscription's type to select different API<b>(one schema is An API)</b>
```js{3-7,12-16}
subscribe: args => {
  const variables = args.variableValues
  if(variables.from){
    graphqlEndpoint = `/api/graphql/${variables.from}`
  }else{
    graphqlEndpoint = `/api/graphql/chat`
  }
  
  return args.rootValue.subscribe(args)
},
onSubscribe: async (ctx, msg) => {
  const yoga = graphqlEndpoint === '/api/graphql/chat' 
  ? await chatSchema('/api/graphql/chat') 
  : graphqlEndpoint === '/api/graphql/comment' 
  ? await commentSchema('/api/graphql/comment') 
  : await chatSchema('/api/graphql/chat')


```
:::


::: warning

### GraphQL Subscriptions
#### Subscriptions allow clients to listen to real-time messages from the server. The client connects to the server with a bi-directional communication channel using the WebSocket protocol and sends a subscription query that specifies which event it is interested in. When an event is triggered, the server executes the stored GraphQL query, and the result is sent back to the client using the same communication channel.

The client can unsubscribe by sending a message to the server. The server can also unsubscribe at any time due to errors or timeouts. A significant difference between queries or mutations and subscriptions is that subscriptions are stateful and require maintaining the GraphQL document, variables, and context over the lifetime of the subscription.

![An image](/subscription_flow.png)

### Above the processing
#### 1. client: if you use GraphQL Subscriptions, then they will be regestered  firstly 
* you can see them by onSubscribe function -- msg parameter
```
onSubscribe: async (ctx, msg) => {
        // console.log(msg)

```
#### query: 'subscription...

```js{7,17}
{
  id: '009d49d8-388b-469b-a903-6dc03aa38aee',
  type: 'subscribe',
  payload: {
    variables: { from: 'chat' },
    extensions: {},
    query: 'subscription {\n  onGetChat\n}'
  }
}

{
  id: '3c44251c-0869-4019-a478-5b88d21a9211',
  type: 'subscribe',
  payload: {
    variables: { from: 'chat' },
    extensions: {},
    query: 'subscription {\n  onGetChat\n}'
  }
}


```

#### 2. server: we'll define mutation event, you can trigger them in client or server, both ok
* 22-23, we know one mutation can trigger <b>mutiple subscriptions</b>
```js{9,22-23}
module.exports = {
      addIntro:(pubsub,Intro)=>(
        async (_, args, context) => {
          let intro = new Intro({
            content:args.content,
            img:args.img,
          })
          const data = await intro.save()
          pubsub.publish('CHAT_ADD_INTRO', { data })
          return data
      }
      ),

      addChat:(pubsub,Chat)=>(
        async (_, args, context) => {
          let chat = new Chat({
            message:args.message,
            type:args.type,
        })
          const data = await chat.save()
          if(data){
            pubsub.publish('CHAT_ADD_CHAT', { data })
            pubsub.publish('CHAT_ADD_CHAT1', { id:data._id })
          }else{
            // return new GraphQLError('Add chat message failure')
          }
          return data
      }
      ),
};
```

* server:define subscription resolvers
```js{5,17,30}
module.exports = {
  onPostIntro:(pubsub)=>{
    return {
        async *subscribe (_, args, context) {
            for await (const { data } of pubsub.asyncIterator('CHAT_ADD_INTRO')) {
              if (data === null) {
                continue
              }
              yield { onPostIntro: data}
            }
        }
    }
  },
  onPostChat:(pubsub)=>{
    return {
        async *subscribe (_, args, context) {
            for await (const { data } of pubsub.asyncIterator('CHAT_ADD_CHAT')) {
              if (data === null) {
                continue
              }
              yield { onPostChat: data}
            }
        }
    }
  },
  onGetChat:(pubsub)=>{
    return {
      async *subscribe (_, args, context) {
        console.log('0000009999')
        for await (const { id } of pubsub.asyncIterator('CHAT_ADD_CHAT1')) {
          if (id === null) {
            continue
          }
          yield { onGetChat:id }
        }
    }
    }
  },
};
```

#### 3. client/server:mutation trigger subscription, UI will update real time

:::
