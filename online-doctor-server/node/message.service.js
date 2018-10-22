var template = require('./template');
var userDetail = require('./user-detail');

var globalMessages = {};

function getMessagesForUser(userName) {
    //console.log("Curernt Messages :: ",messages);
    console.log("Get message for user ", userName);
    return globalMessages[userName];
}

function findDesignation(doctorName) {
    var doctors = userDetail.Doctors;
    for (var i = 0; i < doctors.length; i++) {
        if (doctors[i].name == doctorName) {
            return doctors[i].designation;
        }
    }
    return "Not Available";
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
            messages: [],
            designation: findDesignation(from)
        };
    }

    var newMessageId = prevMessage.messageId + 1;
    var message = {
        id: newMessageId,
        template: template.TEMPLATE_1,
        time: new Date(),
        userSent: false,
        shortMessage: 'Your detail is safe'
    }

    newMessageId = newMessageId + 1;

    var message_input = {
        id: newMessageId,
        template: template.TEMPLATE_2,
        time: new Date(),
        userSent: false,
        shortMessage: 'Please select the answer'
    }

    prevMessage.messages.push(message);
    prevMessage.messages.push(message_input);

    prevMessage.messageId = newMessageId;

    globalMessages[userName][from] = prevMessage;
}

module.exports = {
    getMessagesForUser: getMessagesForUser,
    newConsultationForUser: newConsultationForUser
}