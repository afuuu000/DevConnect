module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Posts", "status", {
      type: Sequelize.STRING,
      defaultValue: "pending",
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Posts", "status");
  },
};
