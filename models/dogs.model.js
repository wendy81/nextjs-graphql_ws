const mongoose = require('mongoose')
const Schema = mongoose.Schema

const DogsSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    breed:{
        type:String,
        required:true
    }
})

const Dog =  mongoose.models.Dogs || mongoose.model('Dogs', DogsSchema)

module.exports = {Dog}

