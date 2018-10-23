var template = require('./template');
var userDetail = require('./user-detail');

var globalMessages = {};

function getMessagesForUser(userName) {
    //console.log("Curernt Messages :: ",messages);
    console.log("Get message for user ", userName);
    return globalMessages[userName];
}

function getMessageForUserByDoctor(userName, reqBody) {

    var lastMessageId = 0;
    var forUserName = reqBody.forUserName;

    if (reqBody.lastMessageId != null) {
        lastMessageId = reqBody.lastMessageId;
    }

    console.log("last message id from client :: ", lastMessageId);

    if (lastMessageId == 0) {
        return globalMessages[userName][forUserName];
    }

    var messageList = [];

    var temp = globalMessages[userName][forUserName].messages;

    //console.log("Temps :: -- ", temp);

    for (var i = 0; i < temp.length; i++) {
        if (temp[i].id > lastMessageId) {
            messageList.push(temp[i]);
        }
    }

    return messageList;

}

function findDesignation(doctorName) {
    var doctors = userDetail.Doctors;
    for (var i = 0; i < doctors.length; i++) {
        if (doctors[i].name == doctorName) {
            return doctors[i].designation;
        }
    }
    return "Patient";
}

function findRandomDocByDesignation(designation) {

    var doctors = userDetail.Doctors;
    var dlist = [];
    for (var i = 0; i < doctors.length; i++) {
        if (doctors[i].designation == designation) {
            dlist.push(doctors[i]);
        }
    }

    var len = dlist.length;

    var idx = Math.floor(Math.random() * len);

    if (idx >= len) {
        idx = 0;
    }

    return dlist[idx].name;
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
    } else {

        var localMessageList = prevMessage.messages;

        for (var i = localMessageList.length - 1; i >= 0; i--) {
            var localMessage = localMessageList[i];
            if (localMessage.oldMessage != undefined) {
                break;
            }
            localMessage.oldMessage = true;
        }


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

function answerSelected(userName, reqBody) {

    var messageId = reqBody.id;
    var answer = reqBody.answer;

    var prevMessage = globalMessages[userName][userDetail.DR_ASSISTANT_NAME];
    var temp = prevMessage.messages;

    var record = null;

    for (var i = 0; i < temp.length; i++) {
        if (temp[i].id == messageId) {
            temp[i].oldMessage = true;
            temp[i].answer = answer;
            record = temp[i];
            break;
        }
    }

    if (record != null) {

        if (record.template == template.TEMPLATE_2) {

            if (answer == 'self') {
                var newMessageId = prevMessage.messageId + 1;
                var message = {
                    id: newMessageId,
                    template: template.TEMPLATE_4,
                    time: new Date(),
                    userSent: false,
                    shortMessage: 'Please describe the symptomps'
                }
                prevMessage.messages.push(message);
                prevMessage.messageId = newMessageId;

            } else {

                var newMessageId = prevMessage.messageId + 1;
                var message = {
                    id: newMessageId,
                    template: template.TEMPLATE_3,
                    time: new Date(),
                    userSent: false,
                    shortMessage: 'Please Enter the patient name'
                }
                prevMessage.messages.push(message);
                prevMessage.messageId = newMessageId;

            }

        }


        if (record.template == template.TEMPLATE_3) {

            var newMessageId = prevMessage.messageId + 1;
            var message = {
                id: newMessageId,
                template: template.TEMPLATE_4,
                time: new Date(),
                userSent: false,
                shortMessage: 'Please describe the symptomps'
            }

            prevMessage.messages.push(message);
            prevMessage.messageId = newMessageId;

        }

        if (record.template == template.TEMPLATE_4) {

            var newMessageId = prevMessage.messageId + 1;
            var message = {
                id: newMessageId,
                template: template.TEMPLATE_5,
                time: new Date(),
                userSent: false,
                shortMessage: 'Please select the doctor type'
            }

            prevMessage.messages.push(message);
            prevMessage.messageId = newMessageId;

        }

        if (record.template == template.TEMPLATE_5) {

            var docName = findRandomDocByDesignation(answer);

            var newMessageId = prevMessage.messageId + 1;
            var message = {
                id: newMessageId,
                template: template.TEMPLATE_6,
                time: new Date(),
                userSent: false,
                shortMessage: 'Doctor will contact you shortly',
                actMessage: docName + ' will assist you in this matter. we will contact you soon.'
            }

            prevMessage.messages.push(message);
            prevMessage.messageId = newMessageId;

        }

    }

    return record;

}


module.exports = {
    getMessagesForUser: getMessagesForUser,
    getMessageForUserByDoctor: getMessageForUserByDoctor,
    answerSelected: answerSelected,
    newConsultationForUser: newConsultationForUser
}