var express = require('express');
var router = express.Router();
var auth = require('./../node/authentication')

router.post('/login', auth.login);
router.post('/currentUser', auth.currentLoggedInUser);
router.post('/logout', auth.logout);

module.exports = router;