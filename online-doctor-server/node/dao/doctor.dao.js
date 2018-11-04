const MongoClient = require('mongodb').MongoClient
const tableNames = require('../table_names');


var dbUrl = 'mongodb://test:test1234@ds245523.mlab.com:45523/online_doctor';

var db;

MongoClient.connect(dbUrl, {
    useNewUrlParser: true
}, (err, client) => {
    if (err) return console.log(err)
    db = client.db('online_doctor');
    //console.log("Connection success");
});

function findDesignation(userName, callback) {
    db.collection(tableNames.DOCTORS).find({
        name: userName
    }).toArray(function (err, results) {
        if (results.length == 0) {
            callback('patient');
        } else {
            callback(results[0].designation);
        }
    });
}

/**
 * To find random doctor by designation
 * 
 * @param {*} docterType 
 * @param {*} callback 
 */
function findRandomDoctorForDesignation(designation, callback) {
    db.collection(tableNames.DOCTORS).find({
        designation: designation
    }).toArray(function (err, results) {
        if (results.length > 0) {

            var len = results.length;
            var idx = Math.floor(Math.random() * len);
            if (idx >= len) {
                idx = 0;
            }
            callback(err, results[idx]);
        }
    });
}

module.exports = {
    findDesignation: findDesignation,
    findRandomDoctorForDesignation: findRandomDoctorForDesignation
}