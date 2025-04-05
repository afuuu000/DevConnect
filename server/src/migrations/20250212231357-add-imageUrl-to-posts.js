module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Posts", "imageUrl", {
      type: Sequelize.STRING,
      allowNull: true, // Optional field
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Posts", "imageUrl");
  },
};
