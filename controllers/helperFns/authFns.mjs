import jsSHA from 'jssha';

// initialize salt as a global constant
const { SALT } = process.env;

// fn to hash a string
function getHashedString(stringToHash) {
  // initialise the SHA object
  const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
  // create an unhashed string that is a combi of a salt and the string you want to hash
  const unhashedString = `${SALT}-${stringToHash}`;
  // input the string to-be Hashed into the SHA object
  shaObj.update(unhashedString);
  return shaObj.getHash('HEX');
}

// fn authenticate a user by comparing login credentials to DB data
async function checkAuth(req, res) {
  console.log('checking user credentials');
  // get the user's email and password
  const { currUserEmail, currUserPassword } = req.body;
  // hash the password
  const hashedCurrUserPassword = getHashedString(currUserPassword);
  // compare hashed password acc to users table; email and hashed passwords must be correct.
  try {
    const checkAuthResult = await db.users.findOne({
      where: {
        name: currUserEmail,
        password: hashedCurrUserPassword,
      },
    });
    console.log('findOne result is:');
    console.log(checkAuthResult);
    // manage the scenario where login credentials not legit (i.e. DB entry does not exist)
    if (checkAuthResult === undefined) {
      res.send('login failed');
      return;
    }

    // manage scenario where login credentials are legit
    /* step 1: create a hashed string out of the user's Id+SALT
    step 2: set the above as a cookie stored in the client browser
    step 3: set the user's Id as a cookie in the client's browswer */

    // create a hashed string using userId and SALT
    const hashedCookieString = getHashedString(`${checkAuthResult.id}-${SALT}`);
    // set the the above as a cookie in client's browser
    res.cookie('loggedInHash', hashedCookieString);
    // set the user's id as a cookie in client's browser
    res.cookie('userId', checkAuthResult.id);
  } catch (error) {
    console.log(error);
  }
}

// fn  for middleware that checks if user is logged in everyime he makes an req to site.
// this is a  middleware meant to be run on all routes
function verifySession(req, res, next) {
  // set a default value stating that user is not logged in
  req.isUserLoggedIn = false;

  const { loggedInHash, userId } = req.cookie;

  // check if the hashed userId is the same as loggedInHash
  if (loggedInHash !== getHashedString(`${userId}-${SALT}`)) {
    res.status(403).send('please login');
  }
  // check to see if the cookies you need exists
  if (req.cookies.loggedInHash && req.cookies.userId) {
    // get the hashed value that should be inside the cookie
    const hash = getHashedString(req.cookies.userId);

    // test the value of the cookie
    if (req.cookies.loggedIn === hash) {
      req.isUserLoggedIn = true;
    }
  }
  // tell the user to login if isUserLoggedIn is still false at this point
  if (req.isUserLoggedIn === false) {
    res.status(403).send('Please login to continue');
  }

  next();
}

export default {
  checkAuth,
  getHashedString,
  verifySession,
};
