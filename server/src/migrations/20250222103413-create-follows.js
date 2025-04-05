module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Follows", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      followerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "id" }, // Ensure this matches your Users table
        onDelete: "CASCADE",
      },
      followeeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "id" },
        onDelete: "CASCADE",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Follows");
  },
};
