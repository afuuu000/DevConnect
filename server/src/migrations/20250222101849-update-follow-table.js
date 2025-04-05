module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Follows', 'followingId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // Make sure this is correct
        key: 'id',
      },
      onDelete: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Follows', 'followingId');
  },
};
