let mongoose = require('mongoose')

let profileSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    phone: Number,
    location: String,
    lat: Number,
    lng: Number,
    gender: String,
    address: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        email: String,
        username:String
    }
})

let profile = mongoose.model('profile', profileSchema)

module.exports = profile;
