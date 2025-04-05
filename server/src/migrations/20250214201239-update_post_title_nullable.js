'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Posts', 'title', {
      type: Sequelize.STRING,
      allowNull: true, // ✅ Allow title to be NULL
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Posts', 'title', {
      type: Sequelize.STRING,
      allowNull: false, // Rollback: Make title required again
    });
  }
};
