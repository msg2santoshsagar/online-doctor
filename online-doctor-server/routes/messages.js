var express = require('express');
var wss = require('./../node/websocket_server');
var messageService = require('./../node/message.service');
var userDetail = require('./../node/user-detail');

var router = express.Router();

router.get('/messageList', function (req, res, next) {

    if (req.session.appData !== undefined && req.session.appData !== null) {
        var userName = req.session.appData.userName;
        console.log("user name found :: ", userName);
        var messages = messageService.getMessagesForUser(userName);
        //  console.log("Found message for ", userName, messages);
        res.send(messages);
        return;
    }

    res.send(null);

});

router.post('/messageListByUser', function (req, res, next) {

    if (req.session.appData !== undefined && req.session.appData !== null) {
        var userName = req.session.appData.userName;
        console.log("user name found :: ", userName);
        var reqBody = req.body;
        var messages = messageService.getMessageForUserByDoctor(userName, reqBody);
        //  console.log("Found message for ", userName, messages);
        res.send(messages);
        return;

    }

    res.send(null);

});

router.post('/answerSelected', function (req, res, next) {

    if (req.session.appData !== undefined && req.session.appData !== null) {
        var userName = req.session.appData.userName;
        console.log("user name found :: ", userName);
        var reqBody = req.body;
        try {
            var messages = messageService.answerSelected(userName, reqBody);
        } catch (e) {
            console.log("Error :: ", e);
        }
        wss.sendMessage(userName, {
            task: 'NEW_MESSAGE_AVAILABLE',
            from: userDetail.DR_ASSISTANT_NAME
        });
        if (messages.docName != undefined) {
            wss.sendMessage(userName, {
                task: 'NEW_MESSAGE_AVAILABLE',
                from: messages.docName
            });
            wss.sendMessage(messages.docName, {
                task: 'NEW_MESSAGE_AVAI(LABLE',
                from: userName
            });
            delete messages.docName;
        }

        res.send(messages);
        return;

    }

    res.send(null);

});

router.post('/consultationPacagePurchased', function (req, res, next) {
    var body = req.body;
    var userName = body.user;
    var record = messageService.consultationPackagePurchased(body);
    var reqBody = {
        id: body.message.id,
        answer: 'paid'
    };
    var messages = messageService.answerSelected(userName, reqBody);

    wss.sendMessage(userName, {
        task: 'NEW_MESSAGE_AVAILABLE',
        from: userDetail.DR_ASSISTANT_NAME
    });
    if (messages.docName != undefined) {
        wss.sendMessage(userName, {
            task: 'NEW_MESSAGE_AVAILABLE',
            from: messages.docName
        });
        wss.sendMessage(messages.docName, {
            task: 'NEW_MESSAGE_AVAI(LABLE',
            from: userName
        });
        delete messages.docName;
    }

    res.send(record);
});



module.exports = router;