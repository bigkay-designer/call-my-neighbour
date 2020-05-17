const express = require('express')
let mongoose = require('mongoose')

let newsletterSchema = new mongoose.Schema({
    email: String
})

let newsletter = mongoose.model('newsletter', newsletterSchema)

module.exports = newsletter