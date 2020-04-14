let log = console.log;
let express = require('express'),
    router = express.Router()

let profile = require('../models/profile')

var NodeGeocoder = require('node-geocoder');

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
    let name = [{
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    }] 
    let gender =  req.body.gender
    
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
            req.flash('error', 'Invalid address');
            log(err)
            return res.redirect('back');
        }
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;
        let address = [{
            streetName: req.body.address,
            location: location,
            lat: lat,
            lng: lng
        }]
        let newData = [{
            name: name,
            gender: gender,
            address: address,
            author: {
                id: req.user._id,
                email:req.user.email,
                username: req.user.username
            }

        }]
        profile.create(newData, (err, profile) => {
            if (err) {
                log(err)
            } else {
                log(profile)
                res.redirect('/index')
            }
        })
    })
})

//show descripton
router.get('/index', (req, res) => {
    profile.find({}, (err, profile) => {
        if (err) {
            log(err)
        } else {
            res.render('./neighbour/index', {profile: profile})
        }
    })
})


module.exports = router