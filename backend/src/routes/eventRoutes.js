const express = require('express');
const router = express.Router();
const { createEvent, getEvents } = require('../controllers/eventController');

router.route('/')
    .post(createEvent)
    .get(getEvents);

module.exports = router;