const jsSHA = require('jssha');

// initialize salt as a global constant
const { SALT } = process.env;

function getHashedString(stringToHash) {
  // initialise the SHA object
  const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
  // create an unhashed string that is a combi of a salt and the string you want to hash
  const unhashedString = `${SALT}-${stringToHash}`;
  // input the string to-be Hashed into the SHA object
  shaObj.update(unhashedString);
  return shaObj.getHash('HEX');
}

module.exports = {
  up: async (queryInterface) => {
    const usersList = [
      {
        email: 'jon1@gmail.com',
        password: getHashedString('password1'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'jon2@gmail.com',
        password: getHashedString('password1'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Insert categories before items because items reference categories
    await queryInterface.bulkInsert(
      'users',
      usersList,
      { returning: true },
    );
  },

  down: async (queryInterface) => {
    // Delete item before category records because items reference categories
    await queryInterface.bulkDelete('users', null, {});
  },
};
