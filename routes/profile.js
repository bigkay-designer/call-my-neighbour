let log = console.log;
let express = require('express'),
    router = express.Router()
    var NodeGeocoder = require('node-geocoder');

let profile = require('../models/profile')


var options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};
     
var geocoder = NodeGeocoder(options);
    

router.get('/', (req, res) => {
    res.render('./neighbour/landing')
})

router.get('/profile', (req, res) => {
    res.render('profile')
})

router.post('/profile', (req, res) => {
    let firstName = req.body.firstName
    let lastName = req.body.lastName
    let phone = req.body.phone
    let gender = req.body.gender
    let address = req.body.address
    let author = {
        id: req.user._id,
        username: req.user.username
    }
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
            req.flash('error', 'Invalid address');
            log(err)
            return res.redirect('back');
        }
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;
        let newProfile = {firstName: firstName, lastName: lastName, phone: phone, gender: gender, address: address, author: author, location: location, lat: lat, lng: lng}
        
        profile.create(newProfile, (err, profile) => {
            if (err) {
                log(err)
            } else {
                log(req.body)
                res.redirect('/index')
            }
        })
    })
})

// my neighbour page
router.get('/myNeighbour', (req, res) => {
    profile.find({},(err, profile) => {
        if (err) {
            log(err)
        } else {
            res.render('./neighbour/myNeighbour', {profile: profile})
        }
    })
})



module.exports = router