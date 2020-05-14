let log = console.log;

let express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    async = require('async'),
    nodemailer = require('nodemailer'),
    crypto = require('crypto');

let user = require('../models/user')
let profile = require('../models/profile')

router.get('/signup', (req, res) => {
    res.render('signup')
})

router.post('/signup', (req, res) => {
    user.register(new user({email:req.body.email, username: req.body.username }), req.body.password, (err, users) => {
        if (err) {
            req.flash('error', 'A user with the given username is already registered')
            return res.redirect('/signup')
        }
        passport.authenticate('local')(req, res, ()=> {
            req.flash('success', 'welcome ' + req.body.username)
            log(users)
            res.redirect('/profile')
        })
    })
})


router.get('/login', (req, res) => {
    res.render('login')
})

router.post('/login', passport.authenticate('local', {
    successRedirect: '/index',
    failureRedirect : '/login',
    failureFlash: 'Invalid username or passoword.'
}), (req, res)=> {
    req.flash('success', 'welcome back ' + currentuser.username)
})

router.get('/logout', (req, res) => {
    req.logOut()
    req.flash('success', 'successfuly logged out')
    res.redirect('/')
})

// forgot route
router.get('/forgot', (req, res) => {
    res.render('forgot')
})

router.post('/forgot', function(req, res, next) {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        user.findOne({ email: req.body.email }, function(err, user) {
          if (!user) {
            req.flash('error', 'No account with that email address exists.');
            return res.redirect('/forgot');
          }
  
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  
          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      async function  (token, user, done) {

        var mailOptions = {
        to: user.email,
        from: 'callmyneighbour@gmail.com',
        subject: 'Callmyneighbour Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
        try {
        await sgMail.send(mailOptions);
        log('mail-sent')
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        res.redirect('/forgot');
        } catch (error) {
        console.error(error);
        if (error.response) {
            console.error(error.response.body)
        }
        req.flash('error', 'Sorry, something went wrong, please contact cmncontactform@gmail.com');
        res.redirect('/forgot');
        }
      }
    ]);
});

// reset route

router.get('/reset/:token', function(req, res) {
    user.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot');
      }
      res.render('reset', {token: req.params.token});
    });
  });
  
router.post('/reset/:token', function (req, res) {
    async.waterfall([
        function (done) {
            user.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }
                if (req.body.password === req.body.confirm) {
                    user.setPassword(req.body.password, function (err) {
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;
  
                        user.save(function (err) {
                            req.logIn(user, function (err) {
                                done(err, user);
                            });
                        });
                    })
                } else {
                    req.flash("error", "Passwords do not match.");
                    return res.redirect('back');
                }
            });
        },
        async function (user, done) {

            var mailOptions = {
                to: user.email,
                from: 'callmyneighbour@gmail.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            try {
                await sgMail.send(mailOptions);
                log('mail-sent')
                req.flash('success', 'Success! Your password has been changed.');
                res.redirect('/index');
            } catch (error) {
                console.error(error);
                if (error.response) {
                    console.error(error.response.body)
                }
                req.flash('error', 'Sorry, something went wrong, please contact callmyneighbour@gmail.com');
                res.redirect('/index');
            }
        }
    ]);
});


module.exports = router