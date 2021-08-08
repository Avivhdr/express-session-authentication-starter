const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const connection = require('./database');
const User = connection.models.User;
const validatePassword = require('../lib/passwordUtils').validatePassword;

const customFields = {
  usernameField: 'uname',
  passwordField: 'pw'
};

const verifyCallback = (username, password, done) => {
  User.findOne({ username: username })
    .then((user) => {
      if (!user) { return done(null, false/* ,{ message: 'Incorrect username.' }*/) }

      const isValid = validatePassword(password, user.hash, user.salt);

      if (isValid) {
        return done(null, user);
      } else {
        return done(null, false/*, { message: 'Incorrect password.' } */);
      }
    })
    .catch((err) => {
      done(err);
    });
}

const strategy = new LocalStrategy(customFields, verifyCallback);

passport.use(strategy);

passport.serializeUser((user, done) => { // runs after successful login - add the id to the cookie.session.passport
  done(null, user.id);
});

passport.deserializeUser((userId, done) => { // runs on every authenticated request, gets the id from the cookie and adds user object on the request object
  User.findById(userId)
    .then((user) => {
      done(null, user);
    })
    .catch(err => done(err))
});
