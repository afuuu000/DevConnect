module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('Follows', 'followingId', 'followeeId');
    await queryInterface.changeColumn('Follows', 'followeeId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('Follows', 'followeeId', 'followingId');
    await queryInterface.changeColumn('Follows', 'followingId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    });
  },
};
