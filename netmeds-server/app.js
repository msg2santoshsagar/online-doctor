var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var messages = require('./routes/messages');

var NodeSession = require('node-session');
var wsservice = require('./node/websocket_service');
var http = require('http');
var cors = require('cors');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
var nodeSession = new NodeSession({
  'secret': 'Q3UBzdH0GDBCiRCTKbi5MTPyChpzXLsTA',
  'lifetime': 30 * 60 * 1000
});

function session(req, res, next) {
  nodeSession.startSession(req, res, next);
}

app.use(session);

/* var corsOptions = {
  origin: 'http://localhost:4200',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
} */

app.use(cors());

app.use('/', index);
app.use('/api/users', users);
app.use('/api/messages', messages);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});





//Start the server
const PORT = process.env.PORT || 3000;


app.server = http.createServer(app);

wsservice.websocketServer.installHandlers(app.server);


app.server.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

//module.exports = app;