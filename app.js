var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

/* 404 ERROR HANDLER : to catch undefined or non-existent route requests */
app.use((req, res, next) => {
  console.log('404 error handler called')
  const err = new Error('Oops, could not find that page.')
  res.status(404).render('page-not-found', { err });
});

/* GLOBAL ERROR HANDLER */
app.use((err, req, res, next) => {
  if (err) {
    console.log('Global error handler called', err)
  }
  if (err.status === 404){
  res.status(404).render('page-not-found');
  err.message = 'Oops, could not find that page.'
  } else {
    err.message = err.message || 'Oops, something went wrong on the server.';
    res.status(err.status || 500).render('error', { err })
  }
});

module.exports = app;
