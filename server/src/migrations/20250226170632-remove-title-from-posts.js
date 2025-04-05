module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Posts", "title");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("Posts", "title", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
