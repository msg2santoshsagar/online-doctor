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
function saveMessage(messages, markPreviousMessageAsOld, callback) {
    //console.log("Request to save message :: ", messages);
    var insertToDb = function () {
        db.collection(tableNames.MESSAGES).insertMany(messages, function (err, result) {
            //console.log("data saved");
            if (callback !== undefined) {
                callback(result);
            }
        })
    }
    if (markPreviousMessageAsOld) {
        // console.log("Mark previous message as old is true ");
        //query store the search condition
        var query = {
            from: {
                $eq: messages[0].from
            },
            to: {
                $eq: messages[0].to
            },
            oldMessage: {
                $eq: false
            }
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
            insertToDb();
        });

    } else {
        insertToDb();

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