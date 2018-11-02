var express = require('express');
var router = express.Router();

var messageDao = require('./../node/dao/message.dao');

/* GET home page. */
router.get('/', function (req, res, next) {
  messageDao.temp();
  res.render('index', {
    title: 'Express'
  });
});

module.exports = router;