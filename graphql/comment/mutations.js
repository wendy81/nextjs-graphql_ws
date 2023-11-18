const { GraphQLError }= require('graphql') 
module.exports = {
      addIntro:(pubsub,Chat)=>(
        async (_, args, context) => {
          let intro = new Intro({
            content:args.content,
            img:args.img,
          })
          const data = await intro.save()
          pubsub.publish('COMMENT_ADD_INTRO', { data })
          return data
      }
      ),

      addChat:(pubsub,Chat)=>(
        async (_, args, context) => {
          let chat = new Chat({
            message:args.message,
            type:args.type,
        })
        console.log('comment mutations')
          const data = await chat.save()
          if(data){
            pubsub.publish('COMMENT_ADD_CHAT', { data })
          }else{
            // return new GraphQLError('Add chat message failure')
          }
          return data
      }
      )
};