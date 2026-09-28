const Settings = require('../models/Settings');

// @desc    Get studio settings
// @route   GET /api/settings
exports.getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        
        // If no settings exist yet, create default ones
        if (!settings) {
            settings = await Settings.create({});
        }
        
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching settings', error: error.message });
    }
};

// @desc    Update studio settings
// @route   PUT /api/settings
exports.updateSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();

        if (!settings) {
            settings = await Settings.create(req.body);
        } else {
            settings = await Settings.findOneAndUpdate({}, req.body, { returnDocument: 'after' });
        }

        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error updating settings', error: error.message });
    }
};