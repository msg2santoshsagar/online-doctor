var express = require('express');
var router = express.Router();
var mongoDbService = require('./../node/mongo_db_server');
var tableNames = require('../node/table_names');

/* GET home page. */
router.get('/', function (req, res, next) {
  mongoDbService.findAll(tableNames.DOCTORS);
  res.render('index', {
    title: 'Express'
  });
});

module.exports = router;