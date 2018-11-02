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
            console.log("entry available : ", results);
            callback(results[0].designation);
        }
    });
}

module.exports = {
    findDesignation: findDesignation
}