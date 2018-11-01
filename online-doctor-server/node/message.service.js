var template = require('./template');
var userDetail = require('./user-detail');
var messageDao = require('./dao/message.dao');
var defaultMessage = require('./default.message');

var globalMessages = {};

/**
 * To load the message for user
 * 
 * @param {*} userName 
 * @param {*} callback 
 */
function getMessagesForUser(userName, callback) {
    messageDao.findMessageForUser(userName, callback);
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

    console.log("Find random doc by designation for ", designation);

    var doctors = userDetail.Doctors;
    var dlist = [];
    for (var i = 0; i < doctors.length; i++) {
        if (doctors[i].designation == designation) {
            dlist.push(doctors[i]);
        }
    }

    //console.log("Found doctors for designation  ", designation, " and list : ", dlist);

    var len = dlist.length;

    var idx = Math.floor(Math.random() * len);

    console.log(" ranom idx calculated as : ", idx);

    if (idx >= len) {
        idx = 0;
    }

    console.log("idx calculated as : ", idx);

    return dlist[idx].name;
}

function newConsultationForUser(userName) {

    console.log("New consultation req for user : ", userName);

    var from = userDetail.DR_ASSISTANT_NAME;
    var to = userName;

    messageDao.isMessageAvailable(from, to, function (messageAvailable) {
        console.log("message available :: ", messageAvailable);
        var messages = [];
        if (!messageAvailable) {
            messages.push(defaultMessage.getInformationSafeMessage(from, to));
        }
        messages.push(defaultMessage.getPatientTypeSelectionMessage(from, to));
        messageDao.saveMessage(messages);
    })

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

        if (record.template == template.TEMPLATE_5 || record.template == template.TEMPLATE_6) {
            // Final One.. Assign a doctor now

            //check if user is having consultation credit, if not ask to pay

            // =============================================

            if (prevMessage.consultationCredit == null || prevMessage.consultationCredit <= 0) {
                var newMessageId = prevMessage.messageId + 1;
                var message = {
                    id: newMessageId,
                    template: template.TEMPLATE_8,
                    time: new Date(),
                    userSent: false,
                    shortMessage: 'Please choose consultation plan'
                }

                prevMessage.messages.push(message);
                prevMessage.messageId = newMessageId;

                if (prevMessage.messageId > 0) {
                    return record;
                }
            }
            // ==============================================

            if (record.template == template.TEMPLATE_6) {
                for (var i = 0; i < temp.length; i++) {
                    if (temp[i].id == messageId - 1) {
                        answer = temp[i].answer;
                        break;
                    }
                }
            }

            prevMessage.consultationCredit = prevMessage.consultationCredit - 1;

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

            //Add a new message for new doctor
            prevMessage = globalMessages[userName][docName];

            record.docName = docName;

            if (prevMessage == null || prevMessage == undefined) {
                prevMessage = {
                    messageId: 0,
                    consultationCredit: 0,
                    messages: [],
                    designation: findDesignation(docName)
                };
                globalMessages[userName][docName] = prevMessage;
            }

            var newMessageId = prevMessage.messageId + 1;
            if (newMessageId == 1) {
                var message = {
                    id: newMessageId,
                    template: template.TEMPLATE_1,
                    time: new Date(),
                    userSent: false,
                    shortMessage: 'Your detail is safe'
                }
                prevMessage.messages.push(message);
                newMessageId = newMessageId + 1;
            }

            var message_input = {
                id: newMessageId,
                template: template.TEMPLATE_6,
                time: new Date(),
                userSent: false,
                shortMessage: 'Hello ' + userName + ", I am " + docName + ". Please tell me how may I help you",
                actMessage: 'Hello ' + userName + ", I am " + docName + ". Please tell me how may I help you"
            }


            prevMessage.messages.push(message_input);

            prevMessage.messageId = newMessageId;


            //Prepare the message for doctor
            prevMessage = globalMessages[userName][userDetail.DR_ASSISTANT_NAME];
            messageId = prevMessage.messageId;

            console.log("New message id ::: now will find the detail :: ", messageId);

            var patientDetail = [];
            patientDetail[0] = "Hello " + docName + ", Please attend the below patient.";
            patientDetail[2] = "Name : " + userName;
            for (var i = messageId - 1; i >= 0; i--) {
                var tmpMsg = prevMessage.messages[i];
                // console.log("TEMPLATE : ", tmpMsg.template);
                if (tmpMsg.template == template.TEMPLATE_4) {
                    patientDetail[3] = "Symptomps : " + tmpMsg.answer;
                }
                if (tmpMsg.template == template.TEMPLATE_3) {
                    patientDetail[2] = "For : " + tmpMsg.answer;
                }
                if (tmpMsg.template == template.TEMPLATE_2) {
                    patientDetail[1] = "For : " + tmpMsg.answer;
                    break;
                }
            }

            patientDetail = patientDetail.join("\n");
            //console.log("Patient detail :: ",patientDetail);

            // Prepare message for doctor 
            if (globalMessages[docName] == null || globalMessages[docName] == undefined) {
                globalMessages[docName] = {};
            }
            if (globalMessages[docName][userName] == null || globalMessages[docName][userName] == undefined) {
                globalMessages[docName][userName] = {
                    messageId: 0,
                    consultationCredit: 0,
                    messages: [],
                    designation: findDesignation(userName)
                };
                var infoMessage = {
                    id: globalMessages[docName][userName].messageId + 1,
                    template: template.TEMPLATE_1,
                    time: new Date(),
                    userSent: false,
                    shortMessage: 'Your detail is safe'
                }
                globalMessages[docName][userName].messages.push(infoMessage);
                globalMessages[docName][userName].messageId = globalMessages[docName][userName].messageId + 1;

            }
            prevMessage = globalMessages[docName][userName];

            var tMsg = {
                id: prevMessage.messageId + 1,
                template: template.TEMPLATE_6,
                time: new Date(),
                userSent: false,
                shortMessage: patientDetail,
                actMessage: patientDetail
            }

            prevMessage.messages.push(tMsg);
            prevMessage.messageId = prevMessage.messageId + 1;


        }

    }

    return record;

}

function newMessage(messageJson) {
    console.log("new message for process : ", messageJson);

    var from = messageJson.from;
    var to = messageJson.to;
    var msg = messageJson.msg;
    var time = new Date();

    /* console.log("From  : ", from);
    console.log("to  : ", to);
    console.log("msg  : ", msg);
    console.log("time  : ", time); */

    if (globalMessages[from] == null || globalMessages[from] == undefined) {
        globalMessages[from] = {};
    }

    if (globalMessages[from][to] == null || globalMessages[from][to] == undefined) {
        globalMessages[from][to] = {
            messageId: 0,
            consultationCredit: 0,
            messages: [],
            designation: findDesignation(to)
        }
        var infoMessage = {
            id: globalMessages[from][to].messageId + 1,
            template: template.TEMPLATE_1,
            time: time,
            userSent: false,
            shortMessage: 'Your detail is safe'
        }
        globalMessages[from][to].messages.push(infoMessage);
        globalMessages[from][to].messageId = globalMessages[from][to].messageId + 1;
    }

    var fromMessages = globalMessages[from][to];
    var newMessageId = fromMessages.messageId + 1;
    var fMsg = {
        id: newMessageId,
        template: template.TEMPLATE_7,
        time: time,
        userSent: false,
        shortMessage: msg,
        actMessage: msg
    }
    globalMessages[from][to].messages.push(fMsg);
    globalMessages[from][to].messageId = globalMessages[from][to].messageId + 1;

    if (globalMessages[to] == null || globalMessages[to] == undefined) {
        globalMessages[to] = {};
    }

    if (globalMessages[to][from] == null || globalMessages[to][from] == undefined) {
        globalMessages[to][from] = {
            messageId: 0,
            consultationCredit: 0,
            messages: [],
            designation: findDesignation(from)
        }
        var infoMessage = {
            id: globalMessages[to][from].messageId + 1,
            template: template.TEMPLATE_1,
            time: time,
            userSent: false,
            shortMessage: 'Your detail is safe'
        }
        globalMessages[to][from].messages.push(infoMessage);
        globalMessages[to][from].messageId = globalMessages[to][from].messageId + 1;
    }


    var toMessages = globalMessages[to][from];
    newMessageId = toMessages.messageId + 1;
    var tMsg = {
        id: newMessageId,
        template: template.TEMPLATE_6,
        time: time,
        userSent: false,
        shortMessage: msg,
        actMessage: msg
    }
    globalMessages[to][from].messages.push(tMsg);
    globalMessages[to][from].messageId = globalMessages[to][from].messageId + 1;

    //console.log("Message saved in memory :: ", globalMessages[from][to]);


}


function consultationPackagePurchased(reqParam) {

    console.log("Consultation package purchased :: ", reqParam);

    var prevMessages = globalMessages[reqParam.user][userDetail.DR_ASSISTANT_NAME];

    var tempMessages = prevMessages.messages;

    var record = null;

    for (var i = 0; i < tempMessages.length; i++) {
        var tempMessage = tempMessages[i];
        if (tempMessage.id === reqParam.message.id) {
            record = tempMessage;
            tempMessage.template = template.TEMPLATE_6;
            tempMessage.shortMessage = "Your payment successfull";
            tempMessage.actMessage = "You paid consultation fee of " + reqParam.message.selectedPackage.price + " for " + reqParam.message.selectedPackage.name + " consultation.";
            tempMessage.consultationPackage = reqParam.message.selectedPackage;
            tempMessage.consultationPayment = reqParam.payment;
            tempMessage.oldMessage = true;
            var credit = prevMessages.consultationCredit;
            if (credit == null) {
                credit = 0;
            }
            credit = credit + reqParam.message.selectedPackage.credit;
            prevMessages.consultationCredit = credit;
            break;
        }
    }

    return record;

}



module.exports = {
    getMessagesForUser: getMessagesForUser,
    getMessageForUserByDoctor: getMessageForUserByDoctor,
    answerSelected: answerSelected,
    newMessage: newMessage,
    newConsultationForUser: newConsultationForUser,
    consultationPackagePurchased: consultationPackagePurchased
}