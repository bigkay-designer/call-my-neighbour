let express = require('express'),
    bodyParser = require('body-parser'),
    ejs = require('ejs'),
    mongoose = require('mongoose'),
    app = express();

    // ======= routes and models=========
let nighbor = require('./models/neighbor')

app.use(bodyParser.urlencoded({extended: true}))
app.set('view engine', 'ejs')
app.use('/public', express.static (__dirname + '/public'))

app.use(nighbor)
//============================================
// redirect all wrong urls to here
app.get('*', (req, res) => {
    res.send('oops you came to the wrong page');
});

//==============================
// set the port
app.listen(3000, () => {
    console.log('server has started on 3000');
});