const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
var passport = require('passport');
var crypto = require('crypto');
var routes = require('./routes');
const connection = require('./config/database');
const { request } = require('http');

// Package documentation - https://www.npmjs.com/package/connect-mongo
const MongoStore = require('connect-mongo')(session);

/**
 * -------------- GENERAL SETUP ----------------
 */

// Gives us access to variables set in the .env file via `process.env.VARIABLE_NAME` syntax
require('dotenv').config();

// Create the Express application
var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


/**
 * -------------- SESSION SETUP ----------------
 */

const sessionStore = new MongoStore({
  mongooseConnection: connection,
  collection: 'sessions'
});

// have to come before passport.session()
// Add the session to the request object
app.use(session({ 
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  store: sessionStore,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // Equals 1 day (1 day * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms / 1 sec)
  }
}));

/**
 * -------------- PASSPORT AUTHENTICATION ----------------
 */

// Need to require the entire Passport config module so app.js knows about it
require('./config/passport');

// These 2 middleware runs on each route request
// Add the user to the request object
  // app.use((req, res, next) => {
  //   if (request.session.cookie.passport.user !== null) { // a user has session
  //     passport.deserializeUser() // get the user from the db by user id (request.session.cookie.passport.user)
  //   }
  // });
app.use(passport.initialize());
app.use(passport.session()); 

app.use((req, res, next) => {
  console.log('req.user', req.user);
  console.log('req.session', req.session);
  next();
});

app.get('/a', (req, res) => {

  if (req.session.viewCount) {
    req.session.viewCount++;
  } else {
    req.session.viewCount = 1;
  }

  res.send(`<h1>Times visited: ${req.session.viewCount}</h1>`)
})
/**
 * -------------- ROUTES ----------------
 */

// Imports all of the routes from ./routes/index.js
// routes are after middlewares and before error handlers
app.use(routes);


/**
 * -------------- SERVER ----------------
 */

// Server listens on http://localhost:3000
app.listen(3000, () => console.log('Server listens on http://localhost:3000')); // eslint-disable-line no-console);