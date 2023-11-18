export type GenresItems = {
    name: String
    img: String
}

export type MoviePopGenresItems = GenresItems & {
    top:String
}

export type MovieTradingGenresItems = GenresItems & {
    time:String
    watch:String
}

export type MovieNewGenresItems = GenresItems & Pick<MovieTradingGenresItems,'time'>

export type MovieMustGenresItems = GenresItems & Pick<MovieTradingGenresItems,'time'> & {
    rating:Number
    star:String 
}
 

// GenresItems,MoviePopGenresItems,MovieTradingGenresItems,MovieNewGenresItems,MovieMustGenresItems

type PublicGenresType ={
    title:String
    page:Number
}

export type GenresType = PublicGenresType & {
    items:Array<GenresItems>
}
export type PopGenresType = PublicGenresType & {
    items:Array< MoviePopGenresItems>
}
export type TradingGenresType = PublicGenresType & {
    items:Array< MovieTradingGenresItems>
}
export type NewGenresType = PublicGenresType & {
    items:Array< MovieNewGenresItems>
}
export type MustGenresType = PublicGenresType & {
    items:Array< MovieMustGenresItems>
}







