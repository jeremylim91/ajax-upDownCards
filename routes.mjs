// import controllers
import { resolve } from 'path';
import jsSHA from 'jssha';
import db from './models/index.mjs';
import authFns from './controllers/helperFns/authFns.mjs';

// import games from './controller/game.mjs';
import users from './controllers/user.mjs';
import games from './controllers/game.mjs';
import signups from './controllers/signup.mjs';
import logins from './controllers/login.mjs';

const { getHashedString } = authFns;
// initialize salt as a global constant
const { SALT } = process.env;

//= ==========================================
//= ==========================================
//= ==========================================
//= ==========================================
//= ==========================================
//= ==========================================
//= ==========================================

const verifySession = (req, res, next) => {
  console.log('checking auth');
  // set the default value
  req.isUserLoggedIn = false;

  console.log('req.cookies.loggedInHash is:');
  console.log(req.cookies.loggedInHash);
  console.log('req.cookies.userId is:');
  console.log(req.cookies.userId);
  // check to see if the cookies you need exists
  if (req.cookies.loggedInHash && req.cookies.userId) {
    // get the hashed value that should be inside the cookie
    const hash = getHashedString(`${req.cookies.userId}-${SALT}`);
    console.log('hash is:');
    console.log(hash);

    // test the value of the cookie
    if (req.cookies.loggedInHash === hash) {
      req.isUserLoggedIn = true;
      // res.send();
    }
  }
  // prevent user from accessing page unless logged in
  if (req.isUserLoggedIn === false) {
    // From Akira: don't render a page
    // res.render('login-signup');
    // do this instead:
    // This would trigger the catch in the main script/index.js file:
    res.status(403).send();
    return;
  }
  next();
};
//= ============================================================

//= ==========================================
//= ==========================================
//= ==========================================
//= ==========================================
//= ==========================================
//= ==========================================
//= ==========================================
export default function routes(app) {
  // pass in db for all callbacks in controllers
  // const GamesController = games(db);
  const UsersController = users(db);
  const GamesController = games(db);
  const SignupsController = signups(db);
  const LoginsController = logins(db);

  // render an ejs file that allows a user to sign up
  app.get('/signup', SignupsController.newForm);
  app.post('/signup', SignupsController.create);

  // render an ejs file that allows a user to log in
  app.get('/login', LoginsController.newForm);
  app.post('/login', LoginsController.create);

  app.post('/createGame', GamesController.create);
  // special JS page. Include the webpack index.html file

  // end the player's turn
  app.put('/endPlayerTurn', GamesController.endPlayerTurn);

  // end the current game even w/o a winner
  app.put('/endCurrGameWoWinner', GamesController.endCurrGame);

  app.post('/validateDiscardingOfCard', GamesController.validateDiscardingOfCard);
  app.get('/', verifySession, (request, response) => {
    response.sendFile(resolve('js/dist', 'index.html'));
  });
}
