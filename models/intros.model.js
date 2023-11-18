// change schema propery, should restart development
// import mongoose from 'mongoose'
// const Schema = mongoose.Schema
// const IntroSchema = new Schema({
//     content:{
//         type:String,
//         required:true
//     },
//     img:{
//         type:String,
//         required:true
//     }
// })
// const Intro =  mongoose.models.Intros || mongoose.model('Intros', IntroSchema)


const mongoose = require('mongoose')
const Schema = mongoose.Schema
const IntroSchema = new Schema({
    content:{
        type:String,
        required:true
    },
    img:{
        type:String,
        required:true
    }
})
const Intro =  mongoose.models.Intros || mongoose.model('Intros', IntroSchema)

module.exports = {Intro}