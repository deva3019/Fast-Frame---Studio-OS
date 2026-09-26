const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: Date, required: true },
    // This links the Event to a specific Client
    client: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Client', 
        required: true 
    },
    // The Google Drive Strings! 
    driveFolderId: { type: String, required: true }, 
    coverPhotoUrl: { type: String }, 
    
    status: { 
        type: String, 
        enum: ['Upcoming', 'Shooting', 'Editing', 'Delivered'], 
        default: 'Upcoming' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);