const User = require('./userModel.js');
const Organisation = require('./orgModel.js');
const { sequelize } = require('../db/dbConnect.js')

// Associations
User.belongsToMany(Organisation, { through: 'UserOrganisations' });
Organisation.belongsToMany(User, { through: 'UserOrganisations' });


const syncModels = async () => {
  await sequelize.sync({ force: true }); // Set force to false in production to avoid data loss
  console.log('Database synced successfully');
};


module.exports = {
  User,
  Organisation,
  syncModels
};
