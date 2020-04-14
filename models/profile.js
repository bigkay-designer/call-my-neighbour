let mongoose = require('mongoose')

let profileSchema = new mongoose.Schema({
    name: [{
        firstName: String,
        lastName: String,
    }],
    gender: String,
    
    address: [{
        streetName: String,
        location: String,
        lat: Number,
        lng: Number,
    }],
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
