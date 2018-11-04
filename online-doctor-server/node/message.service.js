var template = require('./templates');
var userDetail = require('./user_details');
var messageDao = require('./dao/message.dao');
var userDao = require('./dao/user.dao');
var paymentDao = require('./dao/payments.dao');
var doctorDao = require('./dao/doctor.dao');
var defaultMessage = require('./default.message');

var globalMessages = {};


/**
 * To format the message for browser
 * 
 * @param {*} messageParam 
 */
function formatMessage(messageParam) {

    var messages = {};

    for (var i = 0; i < messageParam.length; i++) {
        param = messageParam[i];
        if (messages[param.from] == undefined) {
            messages[param.from] = {
                messageList: []
            };
        }
        messages[param.from].messageList.push(param);
    }


    return messages;
}


/**
 * To load the message for user
 * 
 * @param {*} userName 
 * @param {*} callback 
 */
function getMessagesForUser(userName, callback) {
    messageDao.findMessageForUser(userName, (err, result) => {
        if (err) {
            console.log("Error occured in fetching message for user : ", userName, " and error is \n", err);
        }
        callback(formatMessage(result));
    });
}

/**
 * To get message for user by doctor
 * if last message id is used then it will send the messages after that id.
 * 
 * @param {*} userName 
 * @param {*} reqBody 
 * @param {*} callback 
 */
function getMessageForUserByDoctor(userName, reqBody, callback) {

    var lastMessageId = 0;
    var from = reqBody.forUserName;

    if (reqBody.lastMessageId != null) {
        lastMessageId = reqBody.lastMessageId;
    }

    //console.log("************************* last message id from client :: ", lastMessageId);

    messageDao.findMessageForUserFromUser(from, userName, lastMessageId, callback);

}

/**
 * Create New consultation for the user
 * 
 * @param {*} userName 
 * @param {*} callback 
 */
function newConsultationForUser(userName, callback) {

    //console.log("New consultation req for user : ", userName);

    var from = userDetail.DR_ASSISTANT_NAME;
    var to = userName;

    messageDao.isMessageAvailable(from, to, function (messageAvailable) {
        // console.log("message available :: ", messageAvailable);
        var messages = [];
        if (!messageAvailable) {
            messages.push(defaultMessage.getInformationSafeMessage(from, to));
        }
        messages.push(defaultMessage.getPatientTypeSelectionMessage(from, to));
        messageDao.saveMessage(messages, true, callback);
    })

}

function answerSelected(userName, reqBody, callback) {

    console.log("Answer selected for ", userName, reqBody);

    messageDao.updateAnswer(reqBody.id, reqBody.answer, (err, result) => {

        var currentRecord = result.value;

        // Template 2 handler :: START
        if (currentRecord.template === template.TEMPLATE_2) {
            var nextMessage = null;
            if (currentRecord.answer === 'self') {
                nextMessage = defaultMessage.getPatientSymptompMessage(currentRecord.from, userName);
            } else {
                nextMessage = defaultMessage.getPatientNameSelectionMessage(currentRecord.from, userName);
            }
            //console.log("Next Message formed :: ", nextMessage);
            messageDao.saveMessage([nextMessage], true, callback);

        } // Template 2 handler :: END

        // Template 3 handler :: START
        if (currentRecord.template === template.TEMPLATE_3) {
            var nextMessage = defaultMessage.getPatientSymptompMessage(currentRecord.from, userName);
            //console.log("Next Message formed :: ", nextMessage);
            messageDao.saveMessage([nextMessage], true, callback);
        } // Template 3 handler :: END

        // Template 4 handler :: START
        if (currentRecord.template === template.TEMPLATE_4) {
            var nextMessage = defaultMessage.getDoctorTypeSelectionMessage(currentRecord.from, userName);
            //console.log("Next Message formed :: ", nextMessage);
            messageDao.saveMessage([nextMessage], true, callback);
        } // Template 4 handler :: END

        // Template 5 handler :: START
        if (currentRecord.template === template.TEMPLATE_5) {
            console.log("Current template is 5");
            userDao.findConsultationCredit(userName, (err, result) => {
                console.log("Consultation credit found : ", result);
                if (result <= 0) {
                    var nextMessage = defaultMessage.getPackageSelectionMessage(currentRecord.from, userName);
                    //console.log("Next Message formed :: ", nextMessage);
                    messageDao.saveMessage([nextMessage], true, callback);
                } else {
                    console.log("User is already having positive credit, so assign the doctor");
                    assignDoctorToUser(userName, currentRecord.answer, (err, doctorAssignedResult) => {
                        console.log("Doctor assigned result found :: ", doctorAssignedResult);
                        currentRecord.docName = doctorAssignedResult.docName;
                        callback(err, currentRecord);
                    })
                }
            });

        } // Template 5 handler :: END



    });
}

function newMessage(messageJson, callback) {
    console.log("new message for process : ", messageJson);

    var from = messageJson.from;
    var to = messageJson.to;
    var msg = messageJson.msg;

    var nextMessageForSender = defaultMessage.getNormalMessageForLeftSide(to, from, msg);
    var nextMessageForReceiver = defaultMessage.getNormalMessageForRightSide(from, to, msg);

    messageDao.saveMessage([nextMessageForSender, nextMessageForReceiver], false, callback)

}

function assignDoctorToUser(userName, doctorType, callback) {
    console.log("assignDoctorToUser : userName : ", userName);
    console.log("assignDoctorToUser : doctorType : ", doctorType);


    function assignDoctor(userName, doctorType) {
        console.log("Request to assign doctor for ", userName, " and doctor type : ", doctorType);
        doctorDao.findRandomDoctorForDesignation(doctorType, (err, docterDetail) => {
            console.log("Doctor found : ", docterDetail);

            userDao.decreaseConsultationCredit(userName, 1, (err, result) => {
                console.log("Consultation credit decreased :: ");


                messageDao.getLastMessages(userDetail.DR_ASSISTANT_NAME, userName, 8, (err, lastMessagesList) => {

                    // console.log("User last messages found :: ", lastMessagesList);

                    var nextMessage1 = defaultMessage.getDocterWillContactMessage(userDetail.DR_ASSISTANT_NAME, userName, docterDetail.name);

                    var nextMessage2 = defaultMessage.getInformationSafeMessage(docterDetail.name, userName);
                    var nextMessage3 = defaultMessage.getInformationSafeMessage(userName, docterDetail.name);

                    var messageForUser = 'Hello ' + userName + ", I am " + docterDetail.name + ". Please tell me how may I help you";
                    var nextMessage4 = defaultMessage.getNormalMessageForRightSide(docterDetail.name, userName, messageForUser);


                    var patientDetail = [];
                    patientDetail[0] = "Hello " + docterDetail.name + ", Please attend the below patient.";
                    patientDetail[2] = "Name : " + userName;
                    patientDetail[4] = "**********MESSAGE BY BOT**********";
                    for (var i = 0; i < lastMessagesList.length; i++) {
                        var tmpMsg = lastMessagesList[i];
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

                    var nextMessage5 = defaultMessage.getNormalMessageForRightSide(userName, docterDetail.name, patientDetail);

                    //console.log("Message 5 : ", nextMessage5);

                    messageDao.isMessageAvailable(docterDetail.name, userName, (msgAvailable) => {
                        console.log("Message Available :: ", msgAvailable);
                        var mlist = [];
                        mlist.push(nextMessage1);
                        if (!msgAvailable) {
                            mlist.push(nextMessage2);
                            mlist.push(nextMessage3);
                        }
                        mlist.push(nextMessage4);
                        mlist.push(nextMessage5);

                        //console.log("Message list prepared :: ", mlist);

                        messageDao.saveMessage(mlist, true, (err, saveMessageResult) => {
                            console.log("Result saved :: ");
                            var resultData = {
                                doctorAssigned: true,
                                docName: docterDetail.name
                            }
                            callback(err, resultData);
                        })

                    })


                });

            });
        });
    }

    if (doctorType == null) {
        messageDao.findDoctoryType(userName, (err, result) => {
            assignDoctor(userName, result);
        });
    } else {
        assignDoctor(userName, doctorType);
    }



}


/**
 * When user purchase any consultation package
 * 
 * @param {*} userName 
 * @param {*} reqParam 
 * @param {*} callback 
 */
function consultationPackagePurchased(userName, reqParam, callback) {

    var messageId = reqParam.message.id;
    var answer = reqParam.message.selectedPackage;
    var paymentData = reqParam.payment;

    messageDao.updateAnswer(messageId, answer, (err, result) => {

        var currentRecord = result.value;

        paymentData.messageId = currentRecord.id;
        paymentData.userName = userName;

        paymentDao.savePayment(paymentData, (err, result) => {
            console.log("Payment data saved");

            userDao.increaseConsultationCredit(userName, answer.credit, (err, result) => {
                console.log("Credit increased");
                var nextMessage = defaultMessage.getPaymentSuccessFullMessage(currentRecord.from, userName, answer.price, answer.credit);
                messageDao.saveMessage([nextMessage], true, (err, result) => {
                    assignDoctorToUser(userName, null, callback);
                });

            });

        });


    });

}

module.exports = {
    getMessagesForUser: getMessagesForUser,
    getMessageForUserByDoctor: getMessageForUserByDoctor,
    answerSelected: answerSelected,
    newMessage: newMessage,
    newConsultationForUser: newConsultationForUser,
    consultationPackagePurchased: consultationPackagePurchased,
    assignDoctorToUser: assignDoctorToUser
}