export async function up(queryInterface, Sequelize) {
  return queryInterface.removeColumn("Follows", "followingId");
}

export async function down(queryInterface, Sequelize) {
  return queryInterface.addColumn("Follows", "followingId", {
    type: Sequelize.INTEGER,
    allowNull: true,
  });
}
