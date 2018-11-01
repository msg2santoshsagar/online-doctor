const MongoClient = require('mongodb').MongoClient


var dbUrl = 'mongodb://test:test1234@ds245523.mlab.com:45523/online_doctor';

var db;

MongoClient.connect(dbUrl, {
    useNewUrlParser: true
}, (err, client) => {
    if (err) return console.log(err)
    db = client.db('online_doctor');
    console.log("Connection success");
});

function save(collectionName, data) {
    db.collection(collectionName).save(data, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
    });
}

function findAll(collectionName) {
    db.collection(collectionName).find().toArray(function (err, results) {
        console.log(results)
    })
}

module.exports = {
    save: save,
    findAll: findAll
}