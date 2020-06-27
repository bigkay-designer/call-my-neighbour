let mongoose = require('mongoose')
let passportLocalMongoose = require('passport-local-mongoose')

let userSchema = new mongoose.Schema({
    email: {type: String, unique: true, required: true},
    username: {type: String, unique: true, required: true},
    password: String,
    resetPasswordToken : String,
    resetPasswordExpires: Date,
})

userSchema.plugin(passportLocalMongoose);
let user = mongoose.model('user', userSchema)

module.exports = user