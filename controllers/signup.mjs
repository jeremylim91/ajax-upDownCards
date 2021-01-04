import authFns from './helperFns/authFns.mjs';

const { getHashedString } = authFns;

export default function signups(db) {
  const newForm = (req, res) => {
    console.log('received get request to signup');
    res.render('signup');
  };

  const create = async (req, res) => {
    console.log('received post request to signup');
    // the the password submitted by the user via the form
    const { password } = req.body;

    // hash the password
    const hashedPassword = getHashedString(password);

    try {
      // add user's credentials into the db
      const createdDBEntry = await db.user.create({
        email: req.body.email,
        password: hashedPassword,
      });
      res.redirect('/login');
    } catch (error) {
      console.log(error);
    }
  };
  return { newForm, create };
}
