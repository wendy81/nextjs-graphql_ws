const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ChatsSchema = new Schema({
    message:{
        type:String,
        required:true
    },
    type:{
        type:String,  // 'own' | 'other'
        required:true
    }
})

const Chat =  mongoose.models.Chats || mongoose.model('Chats', ChatsSchema)

module.exports = {Chat}

