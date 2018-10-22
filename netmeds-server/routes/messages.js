var express = require('express');
var router = express.Router();


var messageList = {};




/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});


router.post('/newConsultations', function (req, res, next) {
    console.log("Request to create a new consultations :: ", req.body);
    res.send('respond with a resource');
});

module.exports = router;