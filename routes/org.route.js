const express = require('express');
const router = express.Router();
const { getAllOrganisationOfUser, getASingleOrganisation, createANewOrganisation, addUserToOrganisation } = require('../controller/org.controller.js');


router.get('/organisations', getAllOrganisationOfUser);
router.get('/organisations/:orgId', getASingleOrganisation);
router.post('/organisations', createANewOrganisation)
router.post('/organisations/:orgId/users', addUserToOrganisation)

module.exports = router;