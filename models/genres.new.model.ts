// change schema propery, should restart development
import mongoose from 'mongoose'
import {GenresItems, MoviePopGenresItems, MovieTradingGenresItems,MovieNewGenresItems,MovieMustGenresItems} from './genres.basic.type'

const Schema = mongoose.Schema

const NewGenreSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    page:{
        type:Number,
        required:false
    },
    items:{
        type:Array<MovieNewGenresItems>,
        required:false
    }
})

export default mongoose.models.NewGenres || mongoose.model('NewGenres', NewGenreSchema)


