const express = require('express');
const router = express.Router();
const { getEvents, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');

router.route('/')
    .get(getEvents)
    .post(createEvent);

router.route('/:id')
    .put(updateEvent) // ADD THIS LINE
    .delete(deleteEvent);

module.exports = router;