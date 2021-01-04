// import controllers
import { resolve } from 'path';
import jsSHA from 'jssha';
import db from './models/index.mjs';

// import games from './controller/game.mjs';
import users from './controllers/user.mjs';
import games from './controllers/game.mjs';
import signups from './controllers/signup.mjs';
import logins from './controllers/login.mjs';

//= ==========================================
//= ==========================================
//= ==========================================
//= ==========================================
//= ==========================================
//= ==========================================
//= ==========================================
const { SALT } = process.env;

const getHash = (input) => {
  // create new SHA object
  const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
  // create an unhashed cookie string based on user ID and salt
  const unhashedString = `${input}-${SALT}`;

  // generate a hashed cookie string using SHA object
  shaObj.update(unhashedString);

  return shaObj.getHash('HEX');
};

const checkAuth = (req, res, next) => {
  console.log('checking auth');
  // set the default value
  req.isUserLoggedIn = false;

  // check to see if the cookies you need exists
  if (req.cookies.loggedIn && req.cookies.userId) {
    // get the hashed value that should be inside the cookie
    const hash = getHash(req.cookies.userId);

    // test the value of the cookie
    if (req.cookies.loggedIn === hash) {
      req.isUserLoggedIn = true;
    }
  }
  // prevent user from accessing page unless logged in
  if (req.isUserLoggedIn === false) {
    // don't render a page
    // res.render('login-signup');
    // This would trigger the catch in the main script/index.js file:
    res.status(403).send();
    return;
  }
  next();
};
//= ==========================================
//= ==========================================
//= ==========================================
//= ==========================================
//= ==========================================
//= ==========================================
//= ==========================================
export default function routes(app) {
  //---------------------------------------
  //---------------------------------------
  //---------------------------------------
  // app.get('/login', (req, res) => {
  //   console.log('received request to login');
  //   res.render('login.ejs');
  // });
  // app.post('/login', (req, res) => {
  //   console.log('received post request to login');
  //   // get the values from the form
  //   const { fUsername, fPassword } = req.body;
  //   // use fUsername to query the database for the hashed password
  //   const queryForPassword = 'SELECT * FROM users WHERE email=$1';
  //   pool;
  //   db.User.get({
  //     where: {
  //       email: req.body.email,
  //     },
  //   })
  //     .query(queryForPassword, [fUsername])
  //     .then((result) => {
  //       const user = result.rows[0];
  //       // hash user.password and compare it with userPassword:
  //       // initialise SHA object
  //       const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
  //       // input the password from the request to the SHA object
  //       shaObj.update(fPassword);
  //       // get the hashed value as output from the SHA object
  //       const hashedPassword = shaObj.getHash('HEX');

  //       /* If the user's hashed password in the database does not
  //      match the hashed input password, login fails */
  //       if (user.password !== hashedPassword) {
  //         // the error for incorrect email and incorrect password are the same for security reasons.
  //         // This is to prevent detection of whether a user has an account for a given service.
  //         res.status(403).send('login failed!');
  //       }
  //       // the user's password matches the hashed password in the DB
  //       else {
  //       // create new SHA object
  //         const hashedCookieShaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
  //         // create an unhashed cookie string based on user ID and salt
  //         const unhashedCookieString = `${user.id}-${SALT}`;
  //         // generate a hashed cookie string using SHA object
  //         hashedCookieShaObj.update(unhashedCookieString);
  //         const hashedCookieString = hashedCookieShaObj.getHash('HEX');
  //         // set the loggedInHash and userId cookies in the response
  //         res.cookie('loggedIn', hashedCookieString);
  //         res.cookie('userId', user.id);
  //         // end the request-response cycle

  //         // redirect to homepage
  //         res.redirect('/home');
  //       }
  //     })
  //     .catch((error) => console.log(error.stack));
  // });

  // Route description: user signup
  // app.get('/signup', (req, res) => {
  //   console.log('received get request to signup');
  //   res.render('signup');
  // });
  // app.post('/signup', (req, res) => {
  //   console.log('received post request to signup');

  //   // initialise the SHA object
  //   const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
  //   // input the password from the request to the SHA object
  //   shaObj.update(req.body.password);
  //   // get the hashed password as output from the SHA object
  //   const hashedPassword = shaObj.getHash('HEX');

  //   db.user.create({
  //     email: req.body.email,
  //     password: hashedPassword,
  //   })
  //     .then((response) => {
  //       res.redirect('/login');
  //     }).catch((error) => console.log(error));
  // });

  //---------------------------------------
  //---------------------------------------
  //---------------------------------------

  // pass in db for all callbacks in controllers
  // const GamesController = games(db);
  const UsersController = users(db);
  const SignupsController = signups(db);
  const LoginsController = logins(db);

  // render an ejs file that allows a user to sign up
  app.get('/signup', SignupsController.newForm);
  app.post('/signup', SignupsController.create);

  // render an ejs file that allows a user to log in
  app.get('/login', LoginsController.newForm);
  app.post('/login', LoginsController.create);

  // special JS page. Include the webpack index.html file
  app.get('/home', (request, response) => {
    response.sendFile(resolve('js/dist', 'index.html'));
  });
}

// middleware will
