require('dotenv').config()
let log = console.log
let express = require('express'),
    bodyParser = require('body-parser'),
    request = require('request')
ejs = require('ejs'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    localStragety = require('passport-local'),
    passportLocalMongoose = require('passport-local-mongoose'),
    flash = require('connect-flash')
    methodOverride = require('method-override'),
    expressSanitizer = require('express-sanitizer'),
    nodemailer = require('nodemailer'),
    sgMail = require('@sendgrid/mail'),
    app = express();

// ======= routes and models=========
let neighbour = require('./models/neighbour');
let profile = require('./models/profile');
let user = require('./models/user')

//sendgrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

let authRoute = require('./routes/auth')
let profileRoute = require('./routes/profile')

mongoose.connect('mongodb+srv://bkdesigner:alaah111@cluster0-5uuok.mongodb.net/test?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
}).then(() => {
  log('connected to the db')
}).catch(err => {
  log('ERROR: ', err.message)
})
    
app.use(flash())
app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'ejs')
app.use('/public', express.static(__dirname + '/public'))
app.use(methodOverride('_method'))

// passport authentication
app.use(
    require('express-session')({
        secret: 'help your neighbour',
        resave: false,
        saveUninitialized: false
    })
);

// Config passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStragety(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser())


// middleWare for nav bar links
app.use((req, res, next) => {
    res.locals.currentuser = req.user;
    res.locals.error = req.flash('error')
    res.locals.success = req.flash('success')
    next();
});


app.use(authRoute)
app.use(profileRoute)



//============================================
// redirect all wrong urls to here
app.get('*', (req, res) => {
    res.render('404');
});

//==============================
// set the port
let host = '0.0.0.0'
let port = process.env.PORT || 3000
app.listen(port, host , () => {
  console.log('server has started ' + port);
});