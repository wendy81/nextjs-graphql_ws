const { GraphQLError }= require('graphql') 
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
      )
};