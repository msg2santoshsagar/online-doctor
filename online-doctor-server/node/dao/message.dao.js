const MongoClient = require('mongodb').MongoClient
const tableNames = require('./../table_names');


var dbUrl = 'mongodb://test:test1234@ds245523.mlab.com:45523/online_doctor';

var db;

/**
 * Connect to database
 */
MongoClient.connect(dbUrl, {
    useNewUrlParser: true
}, (err, client) => {
    if (err) return console.log(err)
    db = client.db('online_doctor');
    //console.log("Connection success");
});


/**
 * It will save the message
 * 
 * if createInfoMessage is true then will check if entry is for first time, it will insert a info record also.
 * 
 * @param {*} message 
 * @param {*} createInfoMessage 
 */
function saveMessage(messages, callback) {
    console.log("Request to save message :: ", messages);
    db.collection(tableNames.MESSAGES).insertMany(messages, function (err, result) {
        console.log("data saved");
    })
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
    console.log("Is message available ", from, to);
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
    }).toArray(function (err, results) {
        callback(results);
    });
}

module.exports = {
    saveMessage: saveMessage,
    isMessageAvailable: isMessageAvailable,
    findMessageForUser: findMessageForUser
}