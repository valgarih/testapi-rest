

const mongoose = require('mongoose')
const Schema = mongoose.Schema


const RestaurantSchema = new Schema({
    id: String,
    rating: Number,
    name: String,
    site: String,
    email: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    lat: Number,
    lng : Number 

})




module.exports = mongoose.model('restaurants', RestaurantSchema)