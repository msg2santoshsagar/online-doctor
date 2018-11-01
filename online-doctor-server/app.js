var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var cors = require('cors');
var wss = require('./node/websocket_server');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var messageRouter = require('./routes/messages');
var environment = require('./environment');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


var corsOptions = {
  origin: 'http://localhost:4200',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true
};

app.use(cors(corsOptions));

var sessionStore = new session.MemoryStore();

var sessionData = session({
  store: sessionStore,
  secret: 'online-doctor-server',
  resave: false,
  saveUninitialized: true
});

// Use the session middleware
app.use(sessionData);

wss.initSessionStore(sessionStore);

//Custom Middle ware to set session if test mode enabled;
app.use(function (req, res, next) {
  if (environment.testMode) {
    if (req.session == undefined) {
      req.session = {};
    }
    if (req.session.appData == undefined) {
      req.session.appData = {
        id: environment.testUser,
        userName: environment.testUser
      }
    }
  }
  next();
});


app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/messages', messageRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
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

module.exports = app;