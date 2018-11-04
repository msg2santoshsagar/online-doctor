var express = require('express');
var wss = require('./../node/websocket_server');
var messageService = require('../node/message.service');
var userDetail = require('./../node/user_details');

var router = express.Router();

router.get('/messageList', function (req, res, next) {
    var userName = req.session.appData.userName;
    //console.log("User name found : " + userName);
    messageService.getMessagesForUser(userName, (result) => {
        res.send(result);
    });
});

router.post('/messageListByUser', function (req, res, next) {

    var userName = req.session.appData.userName;
    var reqBody = req.body;

    messageService.getMessageForUserByDoctor(userName, reqBody, (err, result) => {
        res.send(result);
    });

});

router.post('/answerSelected', function (req, res, next) {

    var userName = req.session.appData.userName;
    var reqBody = req.body;

    messageService.answerSelected(userName, reqBody, (err, result) => {
        //console.log("Answer selected processed : and found result : ", result);
        wss.sendMessage(userName, {
            task: 'NEW_MESSAGE_AVAILABLE',
            from: userDetail.DR_ASSISTANT_NAME
        });
        if (result.docName != undefined) {
            wss.sendMessage(userName, {
                task: 'NEW_MESSAGE_AVAILABLE',
                from: result.docName
            });
            wss.sendMessage(result.docName, {
                task: 'NEW_MESSAGE_AVAILABLE',
                from: userName
            });
            delete result.docName;
        }
        res.send(result);
    });

});

router.post('/consultationPacagePurchased', function (req, res, next) {

    var userName = req.session.appData.userName;
    var reqBody = req.body;

    messageService.consultationPackagePurchased(userName, reqBody, (err, result) => {
        console.log("Consultation package purchase successfull with : ", result);
        wss.sendMessage(userName, {
            task: 'NEW_MESSAGE_AVAILABLE',
            from: userDetail.DR_ASSISTANT_NAME
        });
        if (result.docName != undefined) {
            wss.sendMessage(userName, {
                task: 'NEW_MESSAGE_AVAILABLE',
                from: result.docName
            });
            wss.sendMessage(result.docName, {
                task: 'NEW_MESSAGE_AVAILABLE',
                from: userName
            });
        }
        res.send(result);
    })
});



module.exports = router;