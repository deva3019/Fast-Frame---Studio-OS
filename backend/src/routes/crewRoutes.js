const express = require('express');
const router = express.Router();
const { getCrew, createCrewMember, updateCrewMember, deleteCrewMember } = require('../controllers/crewController');

router.route('/')
    .get(getCrew)
    .post(createCrewMember);

router.route('/:id')
    .put(updateCrewMember)
    .delete(deleteCrewMember);

module.exports = router;