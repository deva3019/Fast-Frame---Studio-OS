const express = require('express');
const router = express.Router();
const { createClient, getClients } = require('../controllers/clientController');

// Map the routes to the controller functions
router.route('/')
    .post(createClient)
    .get(getClients);

module.exports = router;