const express = require('express');
const router = express.Router();
const { createGallery, updateSelection, getGalleries } = require('../controllers/galleryController');

router.route('/')
    .post(createGallery)
    .get(getGalleries);

// PUT request to update the selection for a specific gallery ID
router.route('/:id/select')
    .put(updateSelection);

module.exports = router;