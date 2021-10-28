module.exports = {
  up: (queryInterface, Sequelize) => {
      return Promise.all([
          queryInterface.changeColumn('Posts', 'content', {
              type: Sequelize.TEXT,
              allowNull: true,
          })
      ])
  },

  down: (queryInterface, Sequelize) => {
      return Promise.all([
          queryInterface.changeColumn('Posts', 'content', {
              type: Sequelize.STRING,
              allowNull: true,
          })
      ])
  }
};