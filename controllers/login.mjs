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
    // hash the password
    const hashedCurrUserPassword = getHashedString(password);
    // compare hashed password acc to users table; email and hashed passwords must be correct.
    try {
      const checkAuthResult = await db.user.findOne({
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

      // manage scenario where login credentials are legit
      // step 1: create a hashed string out of the user's Id+SALT
      const hashedCookieString = getHashedString(`${checkAuthResult.id}-${SALT}`);

      // step 2: set the above as a cookie stored in the client browser
      res.cookie('loggedInHash', hashedCookieString);
      // step 3: set the user's Id as a cookie in the client's browswer
      res.cookie('userId', checkAuthResult.id);
      res.redirect('/home');
    } catch (error) {
      console.log(error);
    }
  };
  return { newForm, create };
}
