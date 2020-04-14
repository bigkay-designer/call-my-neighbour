let log = console.log;

let express = require('express'),
    router = express.Router(),
    passport = require('passport');

let user = require('../models/user')

router.get('/signup', (req, res) => {
    res.render('signup')
})

router.post('/signup', (req, res) => {
    user.register(new user({email:req.body.email, username: req.body.username }), req.body.password, (err, user) => {
        if (err) {
            log(err)
        }
        passport.authenticate('local')(req, res, ()=> {
            req.flash('success', 'welcome ' + req.body.username)
            log(user)
            res.redirect('/profile')
        })
    })
})


router.get('/login', (req, res) => {
    res.render('login')
})

router.post('/login', passport.authenticate('local', {
    successRedirect: '/index',
    failureRedirect : '/login'
}), (req, res)=> {
    req.flash('success', 'welcome back ' + currentuser.username)
})

router.get('/logout', (req, res) => {
    req.logOut()
    req.flash('success', 'successfuly logged out')
    res.redirect('/')
})

module.exports = router