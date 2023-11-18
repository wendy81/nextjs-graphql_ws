module.exports = {
  onPostIntro:(pubsub)=>{
    return {
        async *subscribe (_, args, context) {
            // await connDB();
            for await (const { data } of pubsub.asyncIterator('CHAT_ADD_INTRO')) {
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
            for await (const { data } of pubsub.asyncIterator('CHAT_ADD_CHAT')) {
              // const loadIntro = await Intro.find({_id:id})
              if (data === null) {
                continue
              }
              // console.log('data --- 0000 --- 9999 --- data')
              // console.log(data)
              yield { onPostChat: data}
            }
        }
    }
  },
  onGetChat:(pubsub)=>{
    return {
      async *subscribe (_, args, context) {
        console.log('0000009999')
        // await connDB();
        for await (const { id } of pubsub.asyncIterator('CHAT_ADD_CHAT1')) {
          // const loadIntro = await Intro.find({_id:id})
          if (id === null) {
            continue
          }
          // console.log('id --- 0000 --- 9999 --- id')
          // console.log(id)
          yield { onGetChat:id }
        }
    }
    }
  },
};


