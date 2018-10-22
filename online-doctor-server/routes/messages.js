var express = require('express');
var wss = require('./../node/websocket_server');
var messageService = require('./../node/message.service')

var router = express.Router();

router.get('/messageList', function (req, res, next) {

    if (req.session.appData !== undefined && req.session.appData !== null) {
        var userName = req.session.appData.userName;
        console.log("user name found :: ", userName);
        var messages = messageService.getMessagesForUser(userName);
        console.log("Found message for ", userName, messages);
        res.send(messages);
        return;
    }

    res.send(null);

});



module.exports = router;