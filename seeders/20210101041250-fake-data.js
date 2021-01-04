module.exports = {
  up: async (queryInterface) => {
    const usersList = [
      {
        email: 'jon1@gmail.com',
        password: 'password1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'jon2@gmail.com',
        password: 'password1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'jon3@gmail.com',
        password: 'password1',
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
