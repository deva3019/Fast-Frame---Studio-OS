const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    event: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Event', 
        required: true 
    },
    driveFolderId: { type: String, required: true },
    // Array of Google Drive File IDs that the client selects
    selectedPhotos: [{ type: String }],
    status: {
        type: String,
        enum: ['Pending Selection', 'Selection Complete', 'Delivered'],
        default: 'Pending Selection'
    }
}, { timestamps: true });

module.exports = mongoose.model('Gallery', gallerySchema);