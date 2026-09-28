const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    driveFolderId: { type: String, required: true }
}, { _id: false });

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    
    // Client linkage (can be a reference or a simple custom name for legacy events)
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    customClientName: { type: String },
    
    date: { type: Date },
    
    // Gallery & Drive Syncing
    folders: [folderSchema], 
    clientSelections: [{ type: String }],
    syncStatus: { type: String, default: 'Pending' },
    
    // NEW: Post-Production Kanban Stage
    workflowStage: { type: String, default: '' }, 
    
    // General details
    eventType: { type: String },
    venue: { type: String },
    location: { type: String },
    status: { type: String, default: 'Active' },
    
    financials: {
        totalAmount: { type: Number, default: 0 },
        advancePaid: { type: Number, default: 0 },
        paymentMode: { type: String, default: 'Cash' }
    }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);