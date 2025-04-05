'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Posts', 'images', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
    });

    await queryInterface.addColumn('Posts', 'videoUrl', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Posts', 'images');
    await queryInterface.removeColumn('Posts', 'videoUrl');
  }
};
