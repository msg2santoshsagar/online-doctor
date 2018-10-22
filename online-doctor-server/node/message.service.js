var template = require('./template');
var userDetail = require('./user-detail');

var globalMessages = {};

function getMessagesForUser(userName) {
    //console.log("Curernt Messages :: ",messages);
    console.log("Get message for user ", userName);
    return globalMessages[userName];
}

function newConsultationForUser(userName) {

    console.log("New consultation req for user ", userName);

    var from = userDetail.DR_ASSISTANT_NAME;

    if (globalMessages[userName] == null) {
        globalMessages[userName] = {};
    }

    var prevMessage = globalMessages[userName][from];

    if (prevMessage == null) {
        prevMessage = {
            messageId: 0,
            messages: []
        };
    }

    var newMessageId = prevMessage.messageId + 1;
    var message = {
        id: newMessageId,
        template: template.TEMPLATE_1,
        time: new Date()
    }

    prevMessage.messages.push(message);

    globalMessages[userName][from] = prevMessage;
}

module.exports = {
    getMessagesForUser: getMessagesForUser,
    newConsultationForUser: newConsultationForUser
}