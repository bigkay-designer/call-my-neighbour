let log = console.log;
let express = require('express'),
    router = express.Router()
var NodeGeocoder = require('node-geocoder');

let profile = require('../models/profile')
let middleware = require('../middleware/index')


var options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};

var geocoder = NodeGeocoder(options);


router.get('/', (req, res) => {
    profile.find({}, (err, profile) => {
        if (err) {
            log(err)
        } else {
            let slicedProfile = profile.slice(0, 2)
            res.render('./neighbour/landing', { profile: profile })
        }
    })
})
//index page
router.get('/index', middleware.isLoggedIn, (req, res) => {
    // eval(require('locus'))
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        profile.find({ $or: [{ postcode: regex }, { firstName: regex }, {lastName: regex}]}, (err, profile) => {
            if (err) {
                log(err);
            } else {
                if (profile.length < 1) {
                    req.flash('error', 'not found')
                    res.redirect('/index')
                } else {
                    log(profile)
                    res.render('./neighbour/index', { profile: profile });
                }
            }
        });
    } else {
        profile.find({}, (err, profile) => {
            if (err) {
                log(err);
            } else {
                res.render('./neighbour/index', { profile: profile });
            }
        });
    }
});

router.get('/profile', middleware.isLoggedIn, (req, res) => {
    res.render('profile')
})

router.post('/index', middleware.isLoggedIn, (req, res) => {
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let phone = req.body.phone;
    let postcode = req.body.postcode
    let address = req.body.address;
    let gender = req.body.gender
    let author = {
        id: req.user._id,
        username: req.user.username
    };

    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
            req.flash('error', 'Invalid address');
            log(err)
            return res.redirect('back');
        }
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;
        var newCampground = { firstName: firstName, lastName: lastName, phone: phone, address: address, postcode: postcode, gender: gender, author: author, location: location, lat: lat, lng: lng };
        // Create a new campground and save to DB
        profile.create(newCampground, function (err, newlyCreated) {
            if (err) {
                console.log(err);
            } else {
                //redirect back to campgrounds page
                console.log(newlyCreated);
                res.redirect("/index");
            }
        });
    });
});

//about me page
router.get('/about', (req, res) => {
    res.render('./neighbour/about')
})

// my neighbour page
router.get('/index/:id', (req, res) => {
    profile.findById(req.params.id, (err, profile) => {
        if (err) {
            log(err)
        } else {
            res.render('./neighbour/myNeighbour', { profile: profile })
        }
    })
})

//contact us page
router.get('/contact', (req, res) => {
    res.render('./neighbour/contact')
})

// edit profile form
router.get('/:id/edit', middleware.isLoggedIn, (req, res) => {
    profile.find({}, (err, profile) => {
        if (err) {
            log(err)
        } else {
            res.render('./neighbour/edit', {profile:profile})
        }
    })
    
})

// update edit route
router.put('/:id', (req, res) => {
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }
        req.body.lat = data[0].latitude;
        req.body.lng = data[0].longitude;
        req.body.location = data[0].formattedAddress;
        profile.findOneAndUpdate({ 'author.username': req.user.username }, req.body, (err, found) => {
            if (err) {
                log(err)
            } else {
                res.redirect('/index')
            }
        })
    })
})

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router
