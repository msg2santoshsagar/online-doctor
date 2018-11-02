const MongoClient = require('mongodb').MongoClient
const tableNames = require('./../table_names');


var dbUrl = 'mongodb://test:test1234@ds245523.mlab.com:45523/online_doctor';

var db;

MongoClient.connect(dbUrl, {
    useNewUrlParser: true
}, (err, client) => {
    if (err) return console.log(err)
    db = client.db('online_doctor');
    //console.log("Connection success");
});

/**
 * 
 * It will create user entry in database if entry is not available
 * 
 * @param userName user name of the user 
 */
function createUserEntry(userName) {
    //console.log("Request to create user entry for ", userName);
    db.collection(tableNames.USERS).find({
        userName: userName
    }).toArray(function (err, results) {
        if (err) {
            console.log("Error occured while checking user entry : ", err);
            return;
        }
        if (results.length == 0) {
            db.collection(tableNames.USERS).insertOne({
                userName: userName,
                consultationCredit: 0,
                createdDate: new Date()
            });
        }
    });
}

module.exports = {
    createUserEntry: createUserEntry,
}