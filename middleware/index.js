let log = console.log;
let profile = require('../models/profile')

let middlewareObj = {}

middlewareObj.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error', 'please login here first')
    res.redirect('/login');
}

middlewareObj.authorizedUser = (req, res, next) => {
    if (req.isAuthenticated()) {
        profile.find({ 'author.id': req.user._id }, (err, profile) => {
            if (err) {
                log(err)
            } else {
                if (profile == '') {
                    res.render('profile')
                }
                else {
                    res.redirect('/' + req.user._id + '/edit')
                }
            }
        })
    }
}
module.exports = middlewareObj

// middlewareObj.authorizedUser = (req, res, next) => {
//     if (req.isAuthenticated()) {
//         profile.findById(req.params.id, (err, profile) => {
//             if (err || !profile) {
//                 req.flash('error', 'Campground not found')
//                 res.redirect('/index')
//             } else {
//                 if (profile.author.id.equals(req.user._id)) {
//                     next();
//                 } else {
//                     req.flash('error', 'permission denied')
//                     res.redirect('back');
//                 }
//             }
//         });
//     } else {
//         req.flash('error', 'you need to be logged in')
//         res.redirect('back');
//     }
// }