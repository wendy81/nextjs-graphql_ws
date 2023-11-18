// change schema propery, should restart development
import mongoose from 'mongoose'
import {GenresItems, MoviePopGenresItems, MovieTradingGenresItems,MovieNewGenresItems,MovieMustGenresItems} from './genres.basic.type'

const Schema = mongoose.Schema

const PopGenreSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    page:{
        type:Number,
        required:false
    },
    items:{
        type:Array<MoviePopGenresItems>,
        required:false
    }
})

export default mongoose.models.PopGenres || mongoose.model('PopGenres', PopGenreSchema)


