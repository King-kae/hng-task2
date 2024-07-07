// const { Schema, model } = require('mongoose');

// const orgSchema = new Schema({
//     orgId: {
//         type: String,
//         required: true,
//         unique: true
//     },
//     name: {
//         type: String,
//         required: true
//     },
//     description: {
//         type: String,
//         default: ''
//     }
// });

// const Organisation = model('Organisation', orgSchema);

// module.exports = Organisation;

const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/dbConnect.js');

const Organisation = sequelize.define('Organisation', {
  orgId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING
  }
});

module.exports = Organisation;
