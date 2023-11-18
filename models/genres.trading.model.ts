// change schema propery, should restart development
import mongoose from 'mongoose'
import {GenresItems, MoviePopGenresItems, MovieTradingGenresItems,MovieNewGenresItems,MovieMustGenresItems} from './genres.basic.type'

const Schema = mongoose.Schema

const TradingGenreSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    page:{
        type:Number,
        required:false
    },
    items:{
        type:Array<MovieTradingGenresItems>,
        required:false
    }
})

export default mongoose.models.TradingGenres || mongoose.model('TradingGenres', TradingGenreSchema)


