const express = require('express');
const router = express.Router();
const { 
    getPublicGallery, 
    getGalleryImages, 
    saveSelections, 
    getSyncStatus,
    syncShortcuts 
} = require('../controllers/galleryController');

router.get('/public/:eventId', getPublicGallery);
router.get('/folder/:folderId/images', getGalleryImages);
router.post('/:eventId/selections', saveSelections);

router.get('/:eventId/sync-status', getSyncStatus);
router.post('/:eventId/sync-shortcuts', syncShortcuts);

module.exports = router;