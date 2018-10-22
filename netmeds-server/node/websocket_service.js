const sockjs = require('sockjs');
const emitter = require('./customEventEmitter');


//Clients list
var clients = {};

const wsOptions = {
    "sockjs_url": "https://cdn.jsdelivr.net/sockjs/1.1.4/sockjs.min.js",
    "prefix": "/websocket"
};

var websocketServer = sockjs.createServer(wsOptions);

websocketServer.on('connection', function (conn) {

    console.log("New Connection Established  for :: ", conn.id);

    // add this client to clients object
    clients[conn.id] = conn;

    conn.on('data', function (message) {
        conn.write(message);
    });
    conn.on('close', function (code, reason) {
        delete clients[conn.id];
        console.log("Connection closed");
    });
});


//Broadcast to all clients
function broadcast(message) {
    // iterate through each client in clients object
    for (var client in clients) {
        if (clients.hasOwnProperty(client)) {
            // send the message to that client
            clients[client].write(JSON.stringify(message));
        }
    }
}

//Broadcast to all clients
function sendMessage(user, payload) {
    if (clients.hasOwnProperty(user)) {
        // send the message to that client
        clients[client].write(JSON.stringify(message));
    }
}


module.exports = {
    websocketServer: websocketServer,
    broadcast: broadcast,
    sendMessage: sendMessage
};