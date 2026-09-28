const Event = require('../models/Event');
const driveService = require('../services/googleDriveService');

exports.getConfig = (req, res) => {
    res.status(200).json({ 
        serviceEmail: process.env.GDRIVE_CLIENT_EMAIL || 'Email not configured in backend .env' 
    });
};

exports.getPublicGallery = async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId).populate('client', 'name');
        
        if (!event) {
            return res.status(404).json({ message: 'Gallery not found.' });
        }

        const selectionsByFolderObj = event.selectionsByFolder instanceof Map 
            ? Object.fromEntries(event.selectionsByFolder) 
            : (event.selectionsByFolder || {});

        res.status(200).json({
            eventId: event._id,
            eventTitle: event.title,
            clientName: event.client?.name || event.customClientName || 'Client Gallery',
            coverImage: '',
            folders: (event.folders || []).map(f => ({ id: f.driveFolderId, name: f.name })),
            selectedIds: event.clientSelections || [],
            selectionsByFolder: selectionsByFolderObj,
            syncStatus: event.syncStatus || 'IDLE',
            syncLink: event.syncLink || ''
        });
    } catch (error) {
        res.status(500).json({ message: 'Error loading gallery structure', error: error.message });
    }
};

exports.getGalleryImages = async (req, res) => {
    try {
        const { folderId } = req.params;
        const { pageToken } = req.query;
        
        const data = await driveService.fetchPaginatedImages(folderId, pageToken);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching images', error: error.message });
    }
};

exports.saveSelections = async (req, res) => {
    try {
        const { selectedIds, selectionsByFolder } = req.body;
        
        const updateData = {};
        if (Array.isArray(selectedIds)) updateData.clientSelections = selectedIds;
        if (selectionsByFolder && typeof selectionsByFolder === 'object') updateData.selectionsByFolder = selectionsByFolder;

        await Event.findByIdAndUpdate(req.params.eventId, updateData);
        res.status(200).json({ message: 'Selections saved securely.' });
    } catch (error) {
        res.status(500).json({ message: 'Error saving selections', error: error.message });
    }
};

exports.getSyncStatus = async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId).select('syncStatus syncMsg syncLink');
        if (!event) return res.status(404).json({ message: 'Event not found.' });

        res.status(200).json({
            status: event.syncStatus || 'IDLE',
            message: event.syncMsg || '',
            link: event.syncLink || ''
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sync status', error: error.message });
    }
};

exports.syncShortcuts = async (req, res) => {
    try {
        const { targetFolderId } = req.body;
        const event = await Event.findById(req.params.eventId).populate('client', 'name');
        
        if (!event || !event.clientSelections || event.clientSelections.length === 0) {
            return res.status(400).json({ message: 'No selections found to sync.' });
        }
        if (!targetFolderId) {
            return res.status(400).json({ message: 'Destination Folder ID is required.' });
        }

        const clientName = event.client?.name || event.customClientName || 'Client';

        event.syncStatus = 'PROCESSING';
        event.syncMsg = 'Starting synchronization...';
        await event.save();

        // Run sync asynchronously in the background so the HTTP request doesn't timeout[cite: 5]
        driveService.createShortcutsForSelections({
            targetFolderId,
            clientName,
            folders: event.folders || [],
            selectionsByFolder: event.selectionsByFolder || {},
            selectedImageIds: event.clientSelections || [],
            onProgress: async (msg) => {
                await Event.findByIdAndUpdate(event._id, { syncMsg: msg });
            }
        }).then(async (syncResult) => {
            await Event.findByIdAndUpdate(event._id, {
                syncStatus: 'COMPLETED',
                syncMsg: 'Synchronization finished successfully.',
                syncLink: syncResult.folderLink
            });
        }).catch(async (error) => {
            await Event.findByIdAndUpdate(event._id, {
                syncStatus: 'ERROR',
                syncMsg: error.message || 'Synchronization failed.'
            });
        });

        res.status(200).json({ message: 'Synchronization process initiated.' });
    } catch (error) {
        res.status(500).json({ message: 'Error initiating sync', error: error.message });
    }
};