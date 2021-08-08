const router = require('express').Router();
const passport = require('passport');
const genSaltAndHash = require('../lib/passwordUtils').genSaltAndHash;
const connection = require('../config/database');
const User = connection.models.User;
const isAuth = require('./authMiddleware').isAuth;
const isAdmin = require('./authMiddleware').isAdmin;

/**
* -------------- POST ROUTES ----------------
*/

router.post('/login', passport.authenticate('local', {
  failureRedirect: '/login-failure',
  successRedirect: '/login-success',
  // failureFlash: true // TODO-1: Test
}));

router.post('/register', (req, res, next) => {
  const { pw, uname } = req.body;
  const { salt, hash } = genSaltAndHash(pw);

  const newUser = new User({
    username: uname,
    hash,
    salt,
    admin: true
  });

  newUser.save()
    .then((user) => {
      console.log(user);
    });

  res.redirect('/login');
});


/**
* -------------- GET ROUTES ----------------
*/

router.get('/', (req, res, next) => {
  res.send(
            '<h1>Home</h1>\
            <p>Please <a href="/register">register</a></p>\
            <p>or <a href="/login">login</a></p>'
  );
});

// When you visit http://localhost:3000/login, you will see "Login Page"
router.get('/login', (req, res, next) => {

  const form = '<h1>Login Page</h1><form method="POST" action="/login">\
    Enter Username:<br><input type="text" name="uname">\
    <br>Enter Password:<br><input type="password" name="pw">\
    <br><br><input type="submit" value="Submit"></form>';

  res.send(form);

});

// When you visit http://localhost:3000/register, you will see "Register Page"
router.get('/register', (req, res, next) => {

  const form = '<h1>Register Page</h1><form method="post" action="register">\
                    Enter Username:<br><input type="text" name="uname">\
                    <br>Enter Password:<br><input type="password" name="pw">\
                    <br><br><input type="submit" value="Submit"></form>';

  res.send(form);

});

/**
 * Lookup how to authenticate users on routes with Local Strategy
 * Google Search: "How to use Express Passport Local Strategy"
 * 
 * Also, look up what behaviour express session has without a maxage set
 */
router.get('/protected-route', isAuth, (req, res, next) => {
  res.send('You made it to the route.');
});

router.get('/admin-route', isAdmin, (req, res, next) => {
  res.send('You made it to the admin route.');
});

// Visiting this route logs the user out
router.get('/logout', (req, res, next) => {
  req.logout(); // this function deletes the passport object from the req.session.passport.user 
  res.redirect('/protected-route');
});

router.get('/login-success', (req, res, next) => {
  res.send('<p>You successfully logged in. --> <a href="/protected-route">Go to protected route</a></p>');
});

router.get('/login-failure', (req, res, next) => {
  res.send('no user/password');
});

module.exports = router;