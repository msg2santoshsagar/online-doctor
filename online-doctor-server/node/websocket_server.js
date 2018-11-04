var WebSocket = require('ws');
var messageService = require('./message.service');
var userDetail = require('./user_details');
var environment = require('./../environment');


var clients = {}; //To keep the detail of users

var sessionStore;

function initSessionStore(store) {
    this.sessionStore = store;
}


function messageHandler(identity, message) {
    var messageJson = JSON.parse(message);
    var task = messageJson.task;

    switch (task) {

        case 'START_NEW_CONSULTATION':
            handleNewConsultation(identity, messageJson);
            break;
        case 'TEXT_MESSAGE':
            handleNewMessage(identity, messageJson);
            break;
        case 'USER_TYPING_MESSAGE':
            handlerUserTyping(identity, messageJson);
            break;
        default:
            console.log("No handler defined for ", task);

    }

}

function handlerUserTyping(identity, messageJson) {
    sendMessage(messageJson.to, {
        task: 'USER_TYPING_MESSAGE',
        who: messageJson.from
    });
}

function handleNewConsultation(identity, messageJson) {
    console.log("handleNewConsultation :: Input :: ", messageJson);
    messageService.newConsultationForUser(identity, (err, result) => {
        sendMessage(identity, {
            task: 'NEW_MESSAGE_AVAILABLE',
            from: userDetail.DR_ASSISTANT_NAME
        });
    });

}

function handleNewMessage(identity, messageJson) {
    console.log("handleNewMessage :: Input :: ", messageJson);
    messageService.newMessage(messageJson);
    sendMessage(messageJson.to, {
        task: 'NEW_MESSAGE_AVAILABLE',
        from: messageJson.from
    });
}


function init(server) {

    var _this = this;
    var wss = new WebSocket.Server({
        server
    });

    wss.on('connection', function connection(ws, request) {

        if (ws.appSessionId == undefined || ws.appSessionId == null) {
            try {
                var cookies = request.headers.cookie.split("=");
                var sessionId = cookies[1];

                var actualSessionId = '';
                for (var i = 0; i < sessionId.length; i++) {
                    var c = sessionId.charAt(i);
                    if (i <= 3) {
                        continue;
                    }
                    if (c == '.') {
                        break;
                    }
                    actualSessionId += c;
                }
                // console.log("Actual Session Id :: ",actualSessionId);
                _this.sessionStore.get(actualSessionId, function (err, session) {
                    if (session == null || session.appData == null || session.appData.userName == null) {
                        ws.close(undefined, "Session not active");
                        return;
                    }
                    console.log("Session found :: ", session.appData);
                    var userName = session.appData.userName;
                    console.log("user Name :: ", userName);
                    clients[userName] = ws;
                    ws.appSessionId = userName;
                });

            } catch (e) {
                console.log("Failed to parse session id, so rejecting :: ", e);

                if (environment.testMode) {
                    console.log("Test mode enabled,  so setting user as test user");
                    ws.appSessionId = environment.testUser;
                    clients[environment.testUser] = ws;
                } else {
                    ws.close(undefined, "Session not active");
                    return;
                }
            }
        }

        ws.send('connection established');

        ws.on('message', function incoming(message) {
            // console.log("Client  :: ", ws);
            console.log("message received :: ", message);
            //ws.send("Your message received as " + message);
            messageHandler(ws.appSessionId, message);
        });

        ws.on('close', function closed(code, reason) {
            delete clients[ws.appSessionId];
            console.log("Connection closed");

        });


    });

};


//Broadcast to all clients
function broadcast(payload) {
    // iterate through each client in clients object
    for (var client in clients) {
        if (clients.hasOwnProperty(client)) {
            // send the message to that client
            clients[client].send(JSON.stringify(message));
        }
    }
}

//Broadcast to all clients
function sendMessage(user, message) {
    console.log("Request to send the message");
    // iterate through each client in clients object
    if (clients.hasOwnProperty(user)) {
        // send the message to that client
        clients[user].send(JSON.stringify(message));
    }
}


module.exports = {
    init: init,
    initSessionStore: initSessionStore,
    broadcast: broadcast,
    sendMessage: sendMessage
};