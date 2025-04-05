module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if "role" column exists before adding
    const table = await queryInterface.describeTable("Users");
    
    if (!table.role) { // ✅ Prevent duplicate addition
      await queryInterface.addColumn("Users", "role", {
        type: Sequelize.STRING,
        defaultValue: "user",
        allowNull: false,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Users", "role");
  },
};
