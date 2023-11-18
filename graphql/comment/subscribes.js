module.exports = {
  onPostIntro:(pubsub)=>{
    return {
        async *subscribe (_, args, context) {
            // await connDB();
            for await (const { data } of pubsub.asyncIterator('COMMENT_ADD_INTRO')) {
              // const loadIntro = await Intro.find({_id:id})
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
            // await connDB();
            for await (const { data } of pubsub.asyncIterator('COMMENT_ADD_CHAT')) {
              // const loadIntro = await Intro.find({_id:id})
              if (data === null) {
                continue
              }
              yield { onPostChat: data}
            }
        }
    }
  }
  
};


