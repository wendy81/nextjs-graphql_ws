module.exports = {
    hello1: () => 'world123 wer',

    getChat:(Chat)=>(
        async (_, args, context) => {
          const data = await Chat.find()
          return data
        }
    ),

    getChatPagination:(Chat)=>(
      async (_, args, context) => {
        const {first,after,last,before} = args
        const datas = await Chat.find()
        // 起始游标和结束游标至少存在一个
        if (first == null && last == null) {
          throw new Error('invalid params')
        }
        let data
        let hasNextPage
        let hasPreviousPage
        const total = datas.length;
        if (first) {
          // 根据起始游标和需要的数量计算
          const index = datas.findIndex(one => one.id === after)
          data = datas.slice(index + 1, index + 1 + first)
          hasNextPage = index + 1 + first < total
          hasPreviousPage = index > 0
        } else {
          // 根据结束游标和需要的数量计算
          const index = datas.findIndex(one => one.id === before)
          data = datas.slice(Math.max(index - last, 0), index)
          hasNextPage = index + 1 < total
          hasPreviousPage = index - last > 0
        }
        return {
          edges: data.map(one => ({ node: one, cursor: one._id })),
          Pagination: {
            hasNextPage,
            hasPreviousPage,
            totalCount: total,
            totalPageCount: Math.ceil(total / (first || last))
          }
        }
      }
    ),

    getDog:(Dog)=>(
      async (_, args, context) => {
        const {id,name} = args;
        console.log(id)
        const data = await Dog.find({_id:id})
        console.log(data)
        return data[0]
      }
    ),

    getDogs:(Dog)=>(
      async (_, args, context) => {
        const data = await Dog.find()
        return data
      }
    )

};