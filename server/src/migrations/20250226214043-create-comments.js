export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("Comments", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    text: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "Users", key: "id" },
      onDelete: "CASCADE",
    },
    postId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "Posts", key: "id" },
      onDelete: "CASCADE",
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("Comments");
}
