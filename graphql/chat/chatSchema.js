const { createYoga, createSchema }  = require('graphql-yoga')
// 获取subscribes、mutations
const path = require('path')
const subscribesFile = path.join(__dirname, './subscribes.js');
const mutationsFile = path.join(__dirname, './mutations.js');
const queriesFile = path.join(__dirname, './queries.js');
const subscribes = require(subscribesFile)
const mutations = require(mutationsFile)
const queries = require(queriesFile)
// model
const Intros = path.join(__dirname, '../../models/intros.model.js');
const Chats = path.join(__dirname, '../../models/chats.model.js');
const Dogs = path.join(__dirname, '../../models/dogs.model.js');
const {Intro} = require(Intros)
const {Chat} = require(Chats)
const {Dog} = require(Dogs)

// pubsub
const pubsubFile = path.join(__dirname, '../pubsub.js');

const {pubsub} = require(pubsubFile)

module.exports = {
    chatSchema: async (graphqlEndpoint)=> { 
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

            type DogType {
              id:String!
              name:String
              breed:String
              isInCart:String
            }
      
            type Query {
              hello1: String!
              # getChat(curPage:Int!,numPerPage:Int!):[ChatType!]!
              getChat:[ChatType!]!
              getChatPagination(first:Int,after:String,last:Int,before:String):ChatPagination!
              getDog(id:String):DogType!
              getDogs:[DogType!]!
            }
      
            type Subscription {
              clock: Int!
              onPostIntro: IntroType
              onPostChat:ChatType
              onGetChat:ID!
            }
      
            type Mutation {
              addIntro(content:String!,img:String): IntroType,
              addChat(message:String!,type:String): ChatType
            }


            type EdgeNode {
              cursor:String!
              node:ChatType!
            }
            type Pagination {
              totalCount:Int
              totalPageCount:Int
              hasNextPage:Boolean!
              hasPreviousPage:Boolean!
            }

            type ChatPagination{
              edges:[EdgeNode!]!
              Pagination:Pagination!
            }
          `,
          resolvers: {
            Query: {
              hello1:queries.hello1,
              getChat:queries.getChat(Chat),
              getChatPagination:queries.getChatPagination(Chat),
              getDog:queries.getDog(Dog),
              getDogs:queries.getDogs(Dog)
            },
            Subscription: {
              clock: {
                async *subscribe() {
                  for (let i of [11,21,31,41,51]) {
                    // await new Promise(resolve => setTimeout(resolve, 1_000))
                    // yield { clock: new Date().toString()  }
                    yield { clock: i  }
                  }
                }
              },
             onPostIntro:subscribes.onPostIntro(pubsub),
             onPostChat:subscribes.onPostChat(pubsub),
             onGetChat:subscribes.onGetChat(pubsub),
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