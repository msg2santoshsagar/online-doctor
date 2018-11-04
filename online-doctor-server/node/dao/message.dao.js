const MongoClient = require('mongodb').MongoClient
const tableNames = require('./../table_names');
const userDetails = require('../user_details');
const templates = require('../templates');
const environment = require('./../../environment');



var db;

/**
 * Connect to database
 */
MongoClient.connect(environment.dbUrl, {
    useNewUrlParser: true
}, (err, client) => {
    if (err) {
        console.log(err)
    }
    db = client.db('online_doctor');
    //console.log("Connection success");
});

function getValueForNextSequence(sequenceOfName, quantity, callback) {

    db.collection(tableNames.COUNTERS).findOneAndUpdate({
        _id: sequenceOfName
    }, {
        $inc: {
            sequence_value: quantity
        }
    }, {
        returnOriginal: false
    }, (err, result) => {
        callback(err, result.value.sequence_value);
    });
}

/**
 * To set the identifier for the objects
 * 
 * @param {*} dataParam 
 * @param {*} lastNumber 
 */
function setIdentifier(dataParam, lastNumber) {

    var idx = lastNumber - dataParam.length + 1;

    for (var i = 0; i < dataParam.length; i++) {
        var data = dataParam[i];
        data.id = idx;
        idx++;
    }

    return dataParam;
}

/**
 * Save message to database
 * 
 * @param {*} messages 
 * @param {*} callback 
 */
function saveMessagesToDb(messages, callback) {

    getValueForNextSequence(tableNames.MESSAGES, messages.length, function (err, result) {
        if (!err) {
            db.collection(tableNames.MESSAGES).insertMany(setIdentifier(messages, result), callback);
        }
    });
}

/**
 * It will save the message
 * 
 * if createInfoMessage is true then will check if entry is for first time, it will insert a info record also.
 * 
 * @param {*} message 
 * @param {*} createInfoMessage 
 */
function saveMessage(messages, markPreviousMessageAsOld, callback) {

    if (markPreviousMessageAsOld) {
        // console.log("Mark previous message as old is true ");
        //query store the search condition
        var query = {
            from: messages[0].from,
            to: messages[0].to,
            oldMessage: false
        };
        //data stores the updated value
        var data = {
            $set: {
                oldMessage: true
            }
        };
        //console.log("query : ", query);
        db.collection(tableNames.MESSAGES).updateMany(query, data, (err, result) => {
            //console.log("Old message true update result : ");
            saveMessagesToDb(messages, callback);
        });

    } else {
        saveMessagesToDb(messages, callback);
    }
}

/**
 * 
 * To check if message exist for user from sender
 * 
 * @param {*} from 
 * @param {*} to 
 * @param {*} callback 
 */
function isMessageAvailable(from, to, callback) {
    //console.log("Is message available ", from, to);
    db.collection(tableNames.MESSAGES).find({
        from: from,
        to: to
    }).toArray(function (err, results) {
        callback(results.length > 0);
    });
}

/**
 * To find the message for user
 * 
 * @param {*} userName 
 * @param {*} callback 
 */
function findMessageForUser(userName, callback) {
    db.collection(tableNames.MESSAGES).find({
        to: userName
    }).sort({
        id: 1
    }).toArray(callback);
}

function findMessageForUserFromUser(from, to, lastMessageId, callback) {
    //console.log("************************************-------------------");
    db.collection(tableNames.MESSAGES).find({
        from: from,
        to: to,
        id: {
            $gt: lastMessageId
        }
    }).sort({
        id: 1
    }).toArray(function (err, results) {
        // console.log("***********************   Result found for message from user to user : ", results);
        if (callback !== undefined) {
            callback(err, results);
        }
    });
}

/**
 * To update the answer of the given message with id
 * 
 * @param {*} messageId 
 * @param {*} answer 
 * @param {*} callback 
 */
function updateAnswer(messageId, answer, callback) {
    var query = {
        id: messageId
    };
    var data = {
        $set: {
            oldMessage: true,
            answer: answer
        }
    };
    db.collection(tableNames.MESSAGES).findOneAndUpdate(query, data, {
        returnOriginal: false
    }, callback);
}


function findDoctoryType(userName, callback) {
    console.log("Request to find doctor type for user : ", userName);
    db.collection(tableNames.MESSAGES).find({
        from: userDetails.DR_ASSISTANT_NAME,
        to: userName,
        template: templates.TEMPLATE_5
    }).sort({
        id: -1
    }).limit(1).toArray((err, results) => {
        if (results.length > 0) {
            callback(err, results[0].answer);
        }
    });
}

/**
 * To get last messages
 * 
 * @param {*} from 
 * @param {*} userName 
 * @param {*} lmt 
 * @param {*} callback 
 */
function getLastMessages(from, userName, lmt, callback) {
    db.collection(tableNames.MESSAGES).find({
        from: from,
        to: userName
    }).sort({
        id: -1
    }).limit(lmt).toArray((err, results) => {
        callback(err, results);
    });
}



module.exports = {
    saveMessage: saveMessage,
    isMessageAvailable: isMessageAvailable,
    findMessageForUser: findMessageForUser,
    findMessageForUserFromUser: findMessageForUserFromUser,
    updateAnswer: updateAnswer,
    findDoctoryType: findDoctoryType,
    getLastMessages: getLastMessages
}