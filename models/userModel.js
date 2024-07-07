// const mongoose = require('mongoose');
// const { Schema } = mongoose;
// const uniqueValidator = require('mongoose-unique-validator');

// const userSchema = new Schema({
//     userId: {
//         type: String,
//         required: true,
//         unique: true
//     },
//     firstName: { 
//         type: String, 
//         required: true 
//     },
//     lastName: { 
//         type: String, 
//         required: true 
//     },
//     email: { 
//         type: String, 
//         required: true, 
//         unique: true 
//     },
//     password: { 
//         type: String, 
//         required: true 
//     },
//     phone: { type: String },
//     organisations: [{ 
//         type: Schema.Types.ObjectId, 
//         ref: 'Organisation' 
//     }],
//     createdOrganisations: [{ 
//         type: Schema.Types.ObjectId, 
//         ref: 'Organisation' 
//     }]
// }, {
//     timestamps: true
// });

// userSchema.plugin(uniqueValidator);

// const User = mongoose.model('User', userSchema);

// module.exports = User;

const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/dbConnect.js');

const User = sequelize.define('User', {
  userId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    unique: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING
  }
});

module.exports = User;
