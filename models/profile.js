let mongoose = require('mongoose')

let profileSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    phone: Number,
    gender: String,
    address: String,
    city: String,
    postcode: String,
    lat: Number,
    lng: Number,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        email: String,
        username: String
    }
})

let profile = mongoose.model('profile', profileSchema)

module.exports = profile;
