const express = require('express');
const router = express.Router();
const { 
    getPublicGallery, 
    getGalleryImages, 
    saveSelections, 
    getSyncStatus,
    syncShortcuts,
    getConfig 
} = require('../controllers/galleryController');

// 1. Fetch Backend Config (Service Email)
router.get('/config', getConfig);

// 2. Public Client Routes
router.get('/public/:eventId', getPublicGallery);
router.get('/folder/:folderId/images', getGalleryImages);
router.post('/:eventId/selections', saveSelections);

// 3. Telemetry & Synchronization (Restructured to prevent 404 collisions)
router.get('/sync/status/:eventId', getSyncStatus);
router.post('/sync/execute/:eventId', syncShortcuts);

module.exports = router;