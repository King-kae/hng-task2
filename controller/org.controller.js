// const Organisation = require('../models/orgModel.js');
// const User = require('../models/userModel.js');
// const { v4: uuidv4 } = require('uuid');



// // Get all organisations a user belongs to
// const getAllOrganisationOfUser = async (req, res) => {
//   try {
//     const user = await User.findOne({ userId: req.userId }).populate('organisations').select('-_v');
//     console.log(user);
//     if (!user) {
//       return res.status(404).send('User not found');
//     }
//     res.status(200).json({
//       status: "success",
//       message: "Organisations retrieved successfully",
//       data: user.organisations.map((organisation) => {
//           return { 
//             orgId: organisation.orgId,
//             name: organisation.name, 
//             description: organisation.description 
//         }
//       })
//     });
//   } catch (err) {
//     res.status(500).send({
//         message: err.message,
//         status: 500
//     });
//   }
// };

// // Get a single organisation record
// const getASingleOrganisation = async (req, res) => {
//   try {
//     const organisation = await Organisation.findOne({ orgId: req.params.orgId }).select('-_v');
//     if (!organisation) {
//       return res.status(404).send('Organisation not found');
//     }
//     res.status(200).json({
//       status: "success",
//       message: "Organisation retrieved successfully",
//       data: {
//         orgId: organisation.orgId,
//         name: organisation.name,
//         description: organisation.description
//       }
//     });
//   } catch (err) {
//     res.status(500).send(err);
//   }
// };

// // Create a new organisation
// const createANewOrganisation = async (req, res) => {
//   const { name, description } = req.body;

//   // Validation
//   if (!name) {
//     return res.status(422).json({
//       errors: [
//         { field: "name", message: "Name is required" }
//       ]
//     });
//   }

//   const orgId = uuidv4();
//   const newOrg = new Organisation({ orgId, name, description });

//   try {
//     const user = await User.findOne({ userId: req.userId });
//     if (!user) {
//       return res.status(404).send('User not found');
//     }

//     user.organisations.push(newOrg._id);
//     user.createdOrganisations.push(newOrg._id);

//     await newOrg.save();
//     await user.save();

//     res.status(201).json({
//       status: "success",
//       message: "Organisation created successfully",
//       data: {
//         orgId: newOrg.orgId,
//         name: newOrg.name,
//         description: newOrg.description
//       }
//     });
//   } catch (err) {
//     res.status(500).json({
//       status: "Bad request",
//       message: "Client error",
//       statusCode: 400
//     });
//   }
// };

// // Add a user to an organisation
// const addUserToOrganisation = async (req, res) => {
//   const { userId } = req.body;

//   try {
//     const organisation = await Organisation.findOne({ orgId: req.params.orgId });
//     const user = await User.findOne({ userId });

//     if (!organisation || !user) {
//       return res.status(404).send('Organisation or User not found');
//     }

//     user.organisations.push(organisation._id);

//     await organisation.save();
//     await user.save();

//     res.status(200).json({
//       status: "success",
//       message: "User added to organisation successfully"
//     });
//   } catch (err) {
//     res.status(500).json({
//       status: "Bad request",
//       message: "Client error",
//       statusCode: 400,
//       data: err.message
//     });
//   }
// };

// module.exports = {
//     getAllOrganisationOfUser,
//     getASingleOrganisation,
//     createANewOrganisation,
//     addUserToOrganisation
// };

// const Organisation = require('../models/orgModel.js');
// const User = require('../models/userModel.js');
const { User, Organisation } = require('../models');

// Get user details
const getUserById = async (req, res) => {
  try {
    const user = await User.findOne({ where: { userId: req.params.id }, attributes: ['userId', 'firstName', 'lastName', 'email', 'phone'] });
    if (!user) {
      return res.status(404).json({ status: 'Not Found', message: 'User not found' });
    }
    res.status(200).json({
      status: 'success',
      message: 'User details retrieved successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all organisations of a user
const getAllOrganisationOfUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, { include: Organisation });
    res.status(200).json({
      status: 'success',
      message: 'Organisations retrieved successfully',
      data: { organisations: user.Organisations }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error', error: error.message});
  }
};

// Get single organisation
const getASingleOrganisation = async (req, res) => {
  try {
    const organisation = await Organisation.findOne({ where: { orgId: req.params.orgId } });
    if (!organisation) {
      return res.status(404).json({ status: 'Not Found', message: 'Organisation not found' });
    }
    res.status(200).json({
      status: 'success',
      message: 'Organisation retrieved successfully',
      data: organisation
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

// Create new organisation
const createANewOrganisation = async (req, res) => {
  const { name, description } = req.body;
  try {
    const newOrg = await Organisation.create({ name, description });
    await req.user.addOrganisation(newOrg);
    res.status(201).json({
      status: 'success',
      message: 'Organisation created successfully',
      data: newOrg
    });
  } catch (error) {
    res.status(400).json({ status: 'Bad Request', message: 'Client error', statusCode: 400 });
  }
};

// Add user to organisation
const addUserToOrganisation = async (req, res) => {
  const { userId } = req.body;
  try {
    const organisation = await Organisation.findOne({ where: { orgId: req.params.orgId } });
    if (!organisation) {
      return res.status(404).json({ status: 'Not Found', message: 'Organisation not found' });
    }
    const user = await User.findOne({ where: { userId } });
    if (!user) {
      return res.status(404).json({ status: 'Not Found', message: 'User not found' });
    }
    await organisation.addUser(user);
    res.status(200).json({
      status: 'success',
      message: 'User added to organisation successfully'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};


module.exports = {
  getUserById,
  getAllOrganisationOfUser,
  getASingleOrganisation,
  createANewOrganisation,
  addUserToOrganisation
}