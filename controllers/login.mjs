import authFns from './helperFns/authFns.mjs';

const { getHashedString } = authFns;

// initialize salt as a global constant
const { SALT } = process.env;

export default function logins(db) {
  const newForm = (req, res) => {
    console.log('received get request to login');
    res.render('login');
  };

  const create = async (req, res) => {
    console.log('received post request to login');
    // get the user's email and password

    const { password } = req.body;
    console.log(password);
    // hash the password
    const hashedCurrUserPassword = getHashedString(password);
    console.log(hashedCurrUserPassword);
    // compare hashed password acc to users table; email and hashed passwords must be correct.
    try {
      const checkAuthResult = await db.User.findOne({
        where: {
          email: req.body.email,
          password: hashedCurrUserPassword,
        },
      });

      // manage the scenario where login credentials not legit (i.e. DB entry does not exist)
      if (checkAuthResult === null) {
        res.send('login failed');
        return;
      }
      console.log('login successful');
      // manage scenario where login credentials are legit:
      // step 1: create a hashed string out of the user's Id+SALT
      console.log('userId is:');
      console.log(checkAuthResult.id);
      const hashedCookieString = getHashedString(`${checkAuthResult.id}-${SALT}`);

      // step 2: set the above as a cookie stored in the client browser
      res.cookie('loggedInHash', hashedCookieString);
      // step 3: set the user's Id as a cookie in the client's browswer
      res.cookie('userId', checkAuthResult.id);
      res.redirect('/');
    } catch (error) {
      console.log(error);
    }
  };
  return { newForm, create };
}
