const { createYoga, createSchema }  = require('graphql-yoga')
// 获取subscribes、mutations
const path = require('path')
const subscribesFile = path.join(__dirname, './subscribes.js');
const mutationsFile = path.join(__dirname, './mutations.js');
const subscribes = require(subscribesFile)
const mutations = require(mutationsFile)
// model
const Intros = path.join(__dirname, '../../models/intros.model.js');
const Chats = path.join(__dirname, '../../models/chats.model.js');
const {Intro} = require(Intros)
const {Chat} = require(Chats)

// pubsub
const pubsubFile = path.join(__dirname, '../pubsub.js');
const {pubsub} = require(pubsubFile)

module.exports = {
  commentSchema: async (graphqlEndpoint)=> { 
        return createYoga({
        graphqlEndpoint,
        graphiql: {
          subscriptionsProtocol: 'WS'
        },
        cors: request => {
          const requestOrigin = request.headers.get('origin')
          return {
            origin: requestOrigin,
            credentials: true,
            // allowedHeaders: ['X-Custom-Header'],
            methods: ['POST']
          }
        },
        schema: createSchema({
          typeDefs: /* GraphQL */ `
            type IntroType {
              id:String!
              content:String!
              img:String!
            }
            type ChatType {
              id:String!
              message:String!
              type:String!
            }
      
            type Query {
              hello: String!
            }
      
            type Subscription {
              clock: String!
              onPostIntro: IntroType
              onPostChat:ChatType
            }
      
            type Mutation {
              addIntro(content:String!,img:String): IntroType,
              addChat(message:String!,type:String): ChatType,
            }
          `,
          resolvers: {
            Query: {
              hello: () => 'hello world comment'
            },
            Subscription: {
              clock: {
                async *subscribe() {
                  for (let i of [11,21,31,41,51]) {
                    await new Promise(resolve => setTimeout(resolve, 1_000))
                    // yield { clock: new Date().toString()  }
                    yield { clock: i  }
                  }
                }
              },
             onPostIntro:subscribes.onPostIntro(pubsub),
             onPostChat:subscribes.onPostChat(pubsub),
            },
            Mutation: {
              addIntro:mutations.addIntro(pubsub,Intro),
              addChat:mutations.addChat(pubsub,Chat)
            }
          }
        })
      })
    }
  };