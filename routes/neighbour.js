let express = require('express')
let router = express.Router()

router.get('/', (req, res) => {
    res.render('./neighbour/landing')
})

router.get(('/form'), (req, res) => {
    res.send('form page')
})


//show descripton
router.get('/index', (req, res) => {
    res.render('./neighbour/index')
})


module.exports = router