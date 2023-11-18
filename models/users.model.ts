// change schema propery, should restart development
import mongoose from 'mongoose'
const Schema = mongoose.Schema
const UsersSchema = new Schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

export default mongoose.models.Users || mongoose.model('Users', UsersSchema)

