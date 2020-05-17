let log = console.log;
let express = require('express'),
    router = express.Router(),
    async = require('async')
var NodeGeocoder = require('node-geocoder');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

let profile = require('../models/profile')
let user = require('../models/user')
let newsletter = require('../models/newsletter')
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
            res.render('./neighbour/landing', { profile: profile })
        }
    })
})
//index page
router.get('/index', middleware.isLoggedIn, (req, res) => {
    // eval(require('locus'))
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        profile.find({ $or: [{ postcode: regex }, { firstName: regex }, { lastName: regex }] }, (err, profile) => {
            if (err) {
                log(err);
            } else {
                if (profile.length < 1) {
                    req.flash('error', 'not found')
                    res.redirect('/index')
                } else {
                    res.render('./neighbour/index', { profile: profile });
                }
            }
        });
    } else {
        profile.find({ 'author.id': req.user._id }, (err, editProfile) => {
            if (err) {
                log(err)
            } else {
                if (editProfile == '') {
                    req.flash('error', 'Please complete your profile')
                    res.redirect('/profile')
                }
                else {
                    profile.find({}, (err, profile) => {
                        if (err) {
                            log(err);
                        } else {
                            res.render('./neighbour/index', { profile: profile });
                        }
                    });
                    
                }
    
            }
        })
    }
});

router.get('/profile', middleware.isLoggedIn, middleware.authorizedUser, (req, res) => {
        res.render('profile')
})

router.post('/index', middleware.isLoggedIn, (req, res) => {
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let phone = req.body.phone;
    let city = req.body.city
    let address = req.body.address;
    let gender = req.body.gender
    let author = {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email
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
        var newProfile = { firstName: firstName, lastName: lastName, phone: phone, address: address, city: city, gender: gender, author: author, postcode: location, lat: lat, lng: lng };
        // Create a new campground and save to DB
        profile.create(newProfile, function (err, newlyCreated) {
            if (err) {
                console.log(err);
            } else {
                //redirect back to campgrounds page
                console.log(newlyCreated);
                log(req.body)
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
    profile.find({}, (err, profile) => {
        if (err) {
            log(err)
        } else {
            res.render('./neighbour/contact', {profile:profile})
        }
    })
})

router.post('/contact', async (req, res) => {

    const output = `
    <p>You have a new contact request from C.M.N</p>
    <h3>contact details</h3>
    <ul>
        <li><h4>name: ${req.body.name}</h4></li>
        <li><h4>email: ${req.body.email}</h4></li>
        <li><h4>phone: ${req.body.phone}</h4></li>
        <li><h4>subject: ${req.body.subject}</h4></li>
    </ul>
    <h2 style = "text-decoration: underline;">Message</h2>
    <p>${req.body.message}</p>
`;
    let message = req.body.message;
    const msg = {
        from: 'cmncontactform@gmail.com',
        to: 'bigkay478@gmail.com',
        subject: 'C.M.N contact form',
        text: message,
        html: output
    };
    try {
      await sgMail.send(msg);
      req.flash('success', 'Thank you for your email, we will get back to you shortly.');
      res.redirect('/contact');
    } catch (error) {
      console.error(error);
      if (error.response) {
        console.error(error.response.body)
      }
      req.flash('error', 'Sorry, something went wrong, please contact cmncontactform@gmail.com');
      res.redirect('/');
    }
});

// edit profile form
router.get('/:id/edit', middleware.isLoggedIn, (req, res) => {
    profile.find({ 'author.id': req.user._id }, (err, profile) => {
        if (err) {
            log(err)
        } else {
            if (profile == '') {
                res.render('profile')
            }
            else {
                res.render('./neighbour/edit', {profile: profile})
            }
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
router.delete('/:id', (req, res) => {
    profile.findOneAndDelete({ 'author.username': req.user.username }, req.body, (err, deleted) => {
        if (err) {
            log(err)
        }
        user.findByIdAndDelete(req.params.id, (err, deleted) => {
            if (err) {
                log(err)
            } else {
                req.flash('success', 'profile removed')
                res.redirect('/')
            }
        })
    })
})

// ================ CopyRight=====================//
router.get('/terms-of-service', (req, res) => {
    res.render('./copyright/terms-of-service.ejs')
})

router.get('/privacy-policy', (req, res) => {
    res.render('./copyright/privacy-policy')
})

router.get('/disclaimer', (req, res) => {
    res.render('./copyright/disclaimer')
})


// newsletter

router.post('/newsletter', async (req, res) => {

    let newEmail = { email: req.body.newsletter }
        newsletter.findOne({email:req.body.newsletter}, (err, found) => {
            if (err || found) {
                req.flash('error', 'Your email is registered with us already')
                res.redirect('back')
            } else {
                newsletter.create(newEmail, async (err, newemail) => {
                    if (err) {
                        log(err)
                    } else {
                            var mailOptions = {
                                to: newEmail,
                                from: 'callmyneighbour@gmail.com',
                                subject: 'callmyneighbour newsletter',
                                text: 'Hello,\n\n' +
                                    'Thanks for subscribing to our email list!! We will keep you up to date..\n'
                            };
                            try {
                                await sgMail.send(mailOptions);
                                log('mail-sent')
                                req.flash('success', 'Thans for Subscrbing to our newsletter');
                                res.redirect('back');
                            } catch (error) {
                                console.error(error);
                                if (error.response) {
                                    console.error(error.response.body)
                                }
                                req.flash('error', 'Sorry, something went wrong, please contact callmyneighbour@gmail.com');
                                res.redirect('/');
                            }
                    }
                })
            }
        })
    
})

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router
