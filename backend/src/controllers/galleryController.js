const Gallery = require('../models/Gallery');
const Event = require('../models/Event');

// @desc    Create a gallery link for an event
// @route   POST /api/galleries
exports.createGallery = async (req, res) => {
    try {
        const { event, driveFolderId } = req.body;

        const existingEvent = await Event.findById(event);
        if (!existingEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const gallery = await Gallery.create({ event, driveFolderId });
        res.status(201).json(gallery);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update client photo selections
// @route   PUT /api/galleries/:id/select
exports.updateSelection = async (req, res) => {
    try {
        const { selectedPhotos } = req.body;
        
        // Update the gallery with the selected Google Drive string IDs
        const gallery = await Gallery.findByIdAndUpdate(
            req.params.id,
            { 
                selectedPhotos, 
                status: 'Selection Complete' 
            },
            { new: true } // Returns the updated document
        );

        if (!gallery) {
            return res.status(404).json({ message: 'Gallery not found' });
        }

        res.status(200).json(gallery);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all galleries
// @route   GET /api/galleries
exports.getGalleries = async (req, res) => {
    try {
        const galleries = await Gallery.find()
            .populate('event', 'title date')
            .sort({ createdAt: -1 });
        res.status(200).json(galleries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};