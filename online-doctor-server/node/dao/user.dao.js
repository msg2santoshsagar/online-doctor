const MongoClient = require('mongodb').MongoClient
const tableNames = require('./../table_names');
const environment = require('./../../environment');

var db;

MongoClient.connect(environment.dbUrl, {
    useNewUrlParser: true
}, (err, client) => {
    if (err) {
        console.log(err);
        return;
    }
    db = client.db('online_doctor');
    console.log("USER DAO Connection success");
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

function findConsultationCredit(userName, callback) {
    console.log("findConsultationCredit : userName : ", userName);
    db.collection(tableNames.USERS).find({
        userName: userName
    }).toArray(function (err, results) {
        if (results.length > 0) {
            //console.log("Result found : ", results);
            if (callback !== undefined) {
                callback(err, results[0].consultationCredit);
            }
        }
    });
}

/**
 * To incrase the consultation credit for the user
 * 
 * @param {*} userName 
 * @param {*} credit 
 * @param {*} callback 
 */
function increaseConsultationCredit(userName, credit, callback) {
    //console.log("Request to increase consultation credit : ", userName, credit);
    db.collection(tableNames.USERS).findOneAndUpdate({
        userName: userName
    }, {
        $inc: {
            consultationCredit: credit
        }
    }, {
        returnOriginal: false
    }, callback);
}

/**
 * To decrease the consultation credit for the user
 * 
 * @param {*} userName 
 * @param {*} credit 
 * @param {*} callback 
 */
function decreaseConsultationCredit(userName, credit, callback) {
    //console.log("Request to increase consultation credit : ", userName, credit);
    db.collection(tableNames.USERS).findOneAndUpdate({
        userName: userName
    }, {
        $inc: {
            consultationCredit: (0 - credit)
        }
    }, {
        returnOriginal: false
    }, callback);
}


module.exports = {
    createUserEntry: createUserEntry,
    findConsultationCredit: findConsultationCredit,
    increaseConsultationCredit: increaseConsultationCredit,
    decreaseConsultationCredit: decreaseConsultationCredit
}