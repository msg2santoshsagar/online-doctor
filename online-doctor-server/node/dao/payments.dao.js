const MongoClient = require('mongodb').MongoClient
const tableNames = require('./../table_names');
const environment = require('./../../environment');

var db;

MongoClient.connect(environment.dbUrl, {
    useNewUrlParser: true
}, (err, client) => {
    if (err) return console.log(err)
    db = client.db('online_doctor');
    //console.log("Connection success");
});


function savePayment(paymentData, callback) {
    db.collection(tableNames.PAYMENTS).insertOne(paymentData, callback);
}

module.exports = {
    savePayment: savePayment
}